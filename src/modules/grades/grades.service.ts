import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { StudentGrade } from '../../entities/student-grade.entity';
import { GradeBookEntry } from '../../entities/grade-book-entry.entity';
import { Classroom } from '../../entities/classroom.entity';
import { ClassroomMember, ClassroomRole } from '../../entities/classroom-member.entity';
import { GradeType } from '../../entities/grade-type.entity';
import { User } from '../../entities/user.entity';
import {
    CreateGradeBookEntryDto,
    UpdateGradeBookEntryDto,
    CreateSingleGradeDto,
    CreateBatchGradesDto,
    UpdateGradeDto,
    GradeBookEntryResponseDto,
    StudentGradeResponseDto,
    GradeBookOverviewDto,
    StudentGradeSummaryDto,
    FinalGradeCalculationDto
} from './dto/grades.dto';

@Injectable()
export class GradesService {
    constructor(
        @InjectRepository(StudentGrade)
        private gradeRepository: Repository<StudentGrade>,
        
        @InjectRepository(GradeBookEntry)
        private entryRepository: Repository<GradeBookEntry>,
        
        @InjectRepository(Classroom)
        private classroomRepository: Repository<Classroom>,
        
        @InjectRepository(ClassroomMember)
        private memberRepository: Repository<ClassroomMember>,
        
        @InjectRepository(GradeType)
        private gradeTypeRepository: Repository<GradeType>,
        
        @InjectRepository(User)
        private userRepository: Repository<User>,
        
        private dataSource: DataSource,
    ) {}

    /**
     * Tạo đợt chấm điểm mới
     */
    async createGradeBookEntry(
        classroomId: number,
        createDto: CreateGradeBookEntryDto,
        teacherId: number
    ): Promise<GradeBookEntryResponseDto> {
        // Validate teacher permission
        await this.validateTeacherAccess(classroomId, teacherId);

        // Validate grade type exists
        const gradeType = await this.gradeTypeRepository.findOne({
            where: { id: createDto.grade_type_id },
            relations: ['gradingFormula']
        });

        if (!gradeType) {
            throw new NotFoundException('Grade type not found');
        }

        // Get total students in classroom
        const totalStudents = await this.memberRepository.count({
            where: { 
                classroom_id: classroomId, 
                role: ClassroomRole.STUDENT,
                is_active: true 
            }
        });

        const entry = this.entryRepository.create({
            classroom_id: classroomId,
            grade_type_id: createDto.grade_type_id,
            title: createDto.title,
            description: createDto.description,
            max_score: createDto.max_score || 10.0,
            created_by: teacherId,
            due_date: createDto.due_date ? new Date(createDto.due_date) : null,
            is_published: createDto.is_published || false,
            total_students: totalStudents,
            graded_students: 0
        });

        const savedEntry = await this.entryRepository.save(entry);
        return this.mapEntryToResponseDto(savedEntry);
    }

    /**
     * Lấy danh sách đợt chấm điểm
     */
    async getGradeBookEntries(classroomId: number, userId: number): Promise<GradeBookEntryResponseDto[]> {
        // Validate access
        await this.validateMemberAccess(classroomId, userId);

        const entries = await this.entryRepository.find({
            where: { classroom_id: classroomId },
            relations: ['gradeType', 'createdBy'],
            order: { created_at: 'DESC' }
        });

        return entries.map(entry => this.mapEntryToResponseDto(entry));
    }

    /**
     * Nhập điểm cho 1 sinh viên
     */
    async createSingleGrade(
        classroomId: number,
        createDto: CreateSingleGradeDto,
        teacherId: number
    ): Promise<StudentGradeResponseDto> {
        await this.validateTeacherAccess(classroomId, teacherId);

        // Get grade book entry
        const entry = await this.entryRepository.findOne({
            where: { 
                id: createDto.grade_book_entry_id,
                classroom_id: classroomId 
            },
            relations: ['gradeType']
        });

        if (!entry) {
            throw new NotFoundException('Grade book entry not found');
        }

        if (entry.is_finalized) {
            throw new BadRequestException('Cannot modify grades in finalized entry');
        }

        // Validate student is in classroom
        const student = await this.memberRepository.findOne({
            where: {
                classroom_id: classroomId,
                user_id: createDto.student_id,
                role: ClassroomRole.STUDENT,
                is_active: true
            }
        });

        if (!student) {
            throw new NotFoundException('Student not found in classroom');
        }

        // Check if grade already exists
        const existingGrade = await this.gradeRepository.findOne({
            where: {
                classroom_id: classroomId,
                student_id: createDto.student_id,
                grade_type_id: entry.grade_type_id
            }
        });

        if (existingGrade) {
            throw new ConflictException('Grade already exists for this student and grade type');
        }

        // Validate score
        if (createDto.score > entry.max_score) {
            throw new BadRequestException(`Score cannot exceed max score of ${entry.max_score}`);
        }

        const grade = this.gradeRepository.create({
            classroom_id: classroomId,
            student_id: createDto.student_id,
            grade_type_id: entry.grade_type_id,
            score: createDto.score,
            max_score: entry.max_score,
            comments: createDto.comments,
            graded_by: teacherId,
            graded_at: new Date(),
            is_published: createDto.is_published ?? true
        });

        const savedGrade = await this.gradeRepository.save(grade);

        // Update entry graded count
        await this.updateEntryGradedCount(entry.id);

        return this.mapGradeToResponseDto(savedGrade);
    }

    /**
     * Nhập điểm hàng loạt
     */
    async createBatchGrades(
        classroomId: number,
        createDto: CreateBatchGradesDto,
        teacherId: number
    ): Promise<{ success: number; errors: any[] }> {
        await this.validateTeacherAccess(classroomId, teacherId);

        const entry = await this.entryRepository.findOne({
            where: { 
                id: createDto.grade_book_entry_id,
                classroom_id: classroomId 
            },
            relations: ['gradeType']
        });

        if (!entry) {
            throw new NotFoundException('Grade book entry not found');
        }

        if (entry.is_finalized) {
            throw new BadRequestException('Cannot modify grades in finalized entry');
        }

        const results = { success: 0, errors: [] };
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const gradeInput of createDto.grades) {
                try {
                    // Validate student
                    const student = await this.memberRepository.findOne({
                        where: {
                            classroom_id: classroomId,
                            user_id: gradeInput.student_id,
                            role: ClassroomRole.STUDENT,
                            is_active: true
                        }
                    });

                    if (!student) {
                        results.errors.push({
                            student_id: gradeInput.student_id,
                            error: 'Student not found in classroom'
                        });
                        continue;
                    }

                    // Validate score
                    if (gradeInput.score > entry.max_score) {
                        results.errors.push({
                            student_id: gradeInput.student_id,
                            error: `Score cannot exceed max score of ${entry.max_score}`
                        });
                        continue;
                    }

                    // Check existing grade
                    const existingGrade = await this.gradeRepository.findOne({
                        where: {
                            classroom_id: classroomId,
                            student_id: gradeInput.student_id,
                            grade_type_id: entry.grade_type_id
                        }
                    });

                    if (existingGrade) {
                        // Update existing grade
                        existingGrade.score = gradeInput.score;
                        existingGrade.comments = gradeInput.comments;
                        existingGrade.graded_by = teacherId;
                        existingGrade.graded_at = new Date();
                        existingGrade.is_published = createDto.is_published ?? true;

                        await queryRunner.manager.save(existingGrade);
                    } else {
                        // Create new grade
                        const grade = queryRunner.manager.create(StudentGrade, {
                            classroom_id: classroomId,
                            student_id: gradeInput.student_id,
                            grade_type_id: entry.grade_type_id,
                            score: gradeInput.score,
                            max_score: entry.max_score,
                            comments: gradeInput.comments,
                            graded_by: teacherId,
                            graded_at: new Date(),
                            is_published: createDto.is_published ?? true
                        });

                        await queryRunner.manager.save(grade);
                    }

                    results.success++;
                } catch (error) {
                    results.errors.push({
                        student_id: gradeInput.student_id,
                        error: error.message
                    });
                }
            }

            await queryRunner.commitTransaction();

            // Update entry graded count
            await this.updateEntryGradedCount(entry.id);

            return results;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Lấy sổ điểm tổng quan
     */
    async getGradeBookOverview(classroomId: number, userId: number): Promise<GradeBookOverviewDto> {
        await this.validateMemberAccess(classroomId, userId);

        // Get classroom info
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['course', 'course.subject', 'course.semester']
        });

        // Get all students in classroom
        const students = await this.memberRepository.find({
            where: { 
                classroom_id: classroomId, 
                role: ClassroomRole.STUDENT,
                is_active: true 
            },
            relations: ['user']
        });

        // Get all grade types for this classroom's course
        const gradeTypes = await this.gradeTypeRepository.find({
            where: { gradingFormulaId: classroom.course.subject.gradingFormulaId },
            relations: ['gradingFormula']
        });

        // Get all grades for this classroom
        const grades = await this.gradeRepository.find({
            where: { 
                classroom_id: classroomId,
                is_published: true 
            },
            relations: ['gradeType', 'student']
        });

        return this.buildGradeBookOverview(classroom, students, gradeTypes, grades);
    }

    /**
     * Lấy điểm chi tiết của 1 sinh viên
     */
    async getStudentGradeSummary(
        classroomId: number,
        studentId: number,
        requesterId: number
    ): Promise<StudentGradeSummaryDto> {
        await this.validateMemberAccess(classroomId, requesterId);

        // Validate student access (teacher can see all, student can only see own grades)
        const requester = await this.memberRepository.findOne({
            where: { classroom_id: classroomId, user_id: requesterId }
        });

        if (requester.role === ClassroomRole.STUDENT && requesterId !== studentId) {
            throw new ForbiddenException('Students can only view their own grades');
        }

        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['course', 'course.subject']
        });

        const student = await this.userRepository.findOne({
            where: { id: studentId }
        });

        const grades = await this.gradeRepository.find({
            where: { 
                classroom_id: classroomId,
                student_id: studentId,
                is_published: true 
            },
            relations: ['gradeType']
        });

        return this.buildStudentGradeSummary(classroom, student, grades);
    }

    /**
     * Tính điểm cuối kỳ
     */
    async calculateFinalGrades(
        classroomId: number,
        teacherId: number,
        calculationDto: FinalGradeCalculationDto
    ): Promise<any> {
        await this.validateTeacherAccess(classroomId, teacherId);

        const students = await this.memberRepository.find({
            where: { 
                classroom_id: classroomId, 
                role: ClassroomRole.STUDENT,
                is_active: true 
            },
            relations: ['user']
        });

        const results = [];

        for (const student of students) {
            const finalGrade = await this.calculateStudentFinalGrade(
                classroomId, 
                student.user_id,
                calculationDto.include_incomplete
            );

            if (calculationDto.save_as_final) {
                // Save as final grade (implementation depends on your needs)
                // Could create a special grade type for final grades
            }

            results.push({
                student_id: student.user_id,
                student_name: student.user.full_name,
                final_grade: finalGrade.final_score,
                letter_grade: this.getLetterGrade(finalGrade.final_score),
                grade_breakdown: finalGrade.breakdown
            });
        }

        return {
            classroom_id: classroomId,
            calculation_date: new Date(),
            total_students: students.length,
            results: results
        };
    }

    /**
     * Helper methods
     */
    private async validateMemberAccess(classroomId: number, userId: number): Promise<void> {
        const member = await this.memberRepository.findOne({
            where: { 
                classroom_id: classroomId, 
                user_id: userId,
                is_active: true 
            }
        });

        if (!member) {
            throw new ForbiddenException('Access denied to this classroom');
        }
    }

    private async validateTeacherAccess(classroomId: number, userId: number): Promise<void> {
        const member = await this.memberRepository.findOne({
            where: { 
                classroom_id: classroomId, 
                user_id: userId,
                is_active: true 
            }
        });

        if (!member || (member.role !== ClassroomRole.TEACHER && member.role !== ClassroomRole.ASSISTANT)) {
            throw new ForbiddenException('Only teachers can perform this action');
        }
    }

    private async updateEntryGradedCount(entryId: number): Promise<void> {
        const gradedCount = await this.gradeRepository.count({
            where: { grade_type_id: entryId }
        });

        await this.entryRepository.update(entryId, {
            graded_students: gradedCount
        });
    }

    private async calculateStudentFinalGrade(
        classroomId: number, 
        studentId: number, 
        includeIncomplete: boolean = false
    ): Promise<any> {
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['course', 'course.subject']
        });

        const gradeTypes = await this.gradeTypeRepository.find({
            where: { gradingFormulaId: classroom.course.subject.gradingFormulaId }
        });

        const grades = await this.gradeRepository.find({
            where: { 
                classroom_id: classroomId,
                student_id: studentId,
                is_published: true 
            },
            relations: ['gradeType']
        });

        let totalWeightedScore = 0;
        let totalWeight = 0;
        const breakdown = [];

        for (const gradeType of gradeTypes) {
            const typeGrades = grades.filter(g => g.grade_type_id === gradeType.id);
            
            if (typeGrades.length > 0) {
                const averageScore = typeGrades.reduce((sum, g) => sum + (g.score / g.max_score * 10), 0) / typeGrades.length;
                const weightedScore = averageScore * (gradeType.weight / 100);
                
                totalWeightedScore += weightedScore;
                totalWeight += gradeType.weight;

                breakdown.push({
                    grade_type: gradeType.gradeType,
                    weight: gradeType.weight,
                    average_score: averageScore,
                    weighted_score: weightedScore,
                    count: typeGrades.length
                });
            } else if (includeIncomplete) {
                breakdown.push({
                    grade_type: gradeType.gradeType,
                    weight: gradeType.weight,
                    average_score: 0,
                    weighted_score: 0,
                    count: 0
                });
            }
        }

        const finalScore = totalWeight > 0 ? (totalWeightedScore / totalWeight * 100) : 0;

        return {
            final_score: Math.round(finalScore * 100) / 100,
            total_weight: totalWeight,
            breakdown: breakdown
        };
    }

    private getLetterGrade(score: number): string {
        if (score >= 8.5) return 'A';
        if (score >= 7.0) return 'B';
        if (score >= 5.5) return 'C';
        if (score >= 4.0) return 'D';
        return 'F';
    }

    private mapEntryToResponseDto(entry: any): GradeBookEntryResponseDto {
        return {
            id: entry.id,
            classroom_id: entry.classroom_id,
            grade_type_id: entry.grade_type_id,
            title: entry.title,
            description: entry.description,
            max_score: entry.max_score,
            created_by: entry.created_by,
            due_date: entry.due_date,
            is_published: entry.is_published,
            is_finalized: entry.is_finalized,
            total_students: entry.total_students,
            graded_students: entry.graded_students,
            created_at: entry.created_at,
            updated_at: entry.updated_at,
            gradeType: entry.gradeType ? {
                id: entry.gradeType.id,
                gradeType: entry.gradeType.gradeType,
                weight: entry.gradeType.weight,
                description: entry.gradeType.description
            } : undefined,
            createdBy: entry.createdBy ? {
                id: entry.createdBy.id,
                full_name: entry.createdBy.full_name
            } : undefined,
            progress_percentage: entry.total_students > 0 ? 
                Math.round((entry.graded_students / entry.total_students) * 100) : 0
        };
    }

    private mapGradeToResponseDto(grade: any): StudentGradeResponseDto {
        return {
            id: grade.id,
            classroom_id: grade.classroom_id,
            student_id: grade.student_id,
            grade_type_id: grade.grade_type_id,
            score: grade.score,
            max_score: grade.max_score,
            comments: grade.comments,
            graded_by: grade.graded_by,
            graded_at: grade.graded_at,
            is_final: grade.is_final,
            is_published: grade.is_published,
            created_at: grade.created_at,
            updated_at: grade.updated_at,
            student: grade.student ? {
                id: grade.student.id,
                full_name: grade.student.full_name,
                email: grade.student.email
            } : undefined,
            gradeType: grade.gradeType ? {
                id: grade.gradeType.id,
                gradeType: grade.gradeType.gradeType,
                weight: grade.gradeType.weight
            } : undefined,
            gradedBy: grade.gradedBy ? {
                id: grade.gradedBy.id,
                full_name: grade.gradedBy.full_name
            } : undefined,
            percentage: grade.max_score > 0 ? 
                Math.round((grade.score / grade.max_score) * 100 * 100) / 100 : 0
        };
    }

    private buildGradeBookOverview(
        classroom: any, 
        students: any[], 
        gradeTypes: any[], 
        grades: any[]
    ): GradeBookOverviewDto {
        // Implementation for building complete gradebook overview
        // This is a complex method that would aggregate all data
        return {
            classroom_info: {
                id: classroom.id,
                name: classroom.name,
                class_code: classroom.class_code,
                course: {
                    class_code: classroom.course.class_code,
                    subject: {
                        name: classroom.course.subject.name,
                        code: classroom.course.subject.code
                    }
                }
            },
            grade_types: gradeTypes.map(gt => ({
                id: gt.id,
                gradeType: gt.gradeType,
                weight: gt.weight,
                entries_count: grades.filter(g => g.grade_type_id === gt.id).length,
                average_score: 0 // Calculate average
            })),
            students: students.map(s => ({
                id: s.user.id,
                full_name: s.user.full_name,
                email: s.user.email,
                grades: [], // Map student grades
                final_grade: 0,
                letter_grade: 'N/A'
            })),
            statistics: {
                total_students: students.length,
                total_grade_types: gradeTypes.length,
                total_entries: grades.length,
                overall_average: 0,
                grade_distribution: {
                    A: 0, B: 0, C: 0, D: 0, F: 0
                }
            }
        };
    }

    private buildStudentGradeSummary(classroom: any, student: any, grades: any[]): StudentGradeSummaryDto {
        // Implementation for building student grade summary
        return {
            student_info: {
                id: student.id,
                full_name: student.full_name,
                email: student.email
            },
            classroom_info: {
                id: classroom.id,
                name: classroom.name,
                class_code: classroom.class_code
            },
            grades_by_type: [],
            final_grade: 0,
            letter_grade: 'N/A',
            ranking: {
                position: 0,
                total_students: 0,
                percentile: 0
            }
        };
    }
}