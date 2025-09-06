import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not, IsNull } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Classroom } from '../../entities/classroom.entity';
import { ClassroomSchedule } from '../../entities/classroom-schedule.entity';
import { ClassroomPost, PostType, FileAttachment } from '../../entities/classroom-post.entity';
import { ClassroomMember, ClassroomRole } from '../../entities/classroom-member.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { ClassroomStudentGrade } from '../../entities/classroom-student-grade.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { GradesService } from '../grades/grades.service';
import { 
    CreateClassroomDto, 
    UpdateClassroomDto, 
    CreatePostDto, 
    UpdatePostDto, 
    JoinClassroomDto,
    ClassroomResponseDto,
    PostResponseDto
} from './dto/classroom.dto';
import { AddClassroomMemberDto, ClassroomMemberResponseDto } from './dto/classroom-member.dto';
import { ImportStudentDto, ImportStudentResponseDto } from './dto/import-student.dto';
import { 
    CreateClassroomStudentGradeDto, 
    UpdateClassroomStudentGradeDto, 
    ClassroomStudentGradeResponseDto 
} from './dto/classroom-student-grade.dto';
import { CourseData } from 'src/shared/sample/data';
import { Classes } from 'src/entities/classes.entity';
import { Subject } from 'src/entities/subject.entity';
import { CreateClassroomSectionDto } from './dto/classroom-section.dto';
import { ClassroomSection } from 'src/entities/classsroom-section.entity';
import { UserRole } from 'src/shared/constants/enum';
import { Student } from 'src/entities/student.entity';
import { Faculty } from 'src/entities/faculty.entity';

@Injectable()
export class ClassroomService {
    constructor(
        @InjectRepository(Classroom)
        private classroomRepository: Repository<Classroom>,

        @InjectRepository(ClassroomSchedule)
        private classroomScheduleRepository: Repository<ClassroomSchedule>,
        
        @InjectRepository(ClassroomPost)
        private postRepository: Repository<ClassroomPost>,
        
        @InjectRepository(ClassroomMember)
        private memberRepository: Repository<ClassroomMember>,
        
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
        
        @InjectRepository(User)
        private userRepository: Repository<User>,
        
        @InjectRepository(ClassroomStudentGrade)
        private gradeRepository: Repository<ClassroomStudentGrade>,
        
        private fileUploadService: FileUploadService,
        private dataSource: DataSource,

        @InjectRepository(Subject)
        private subjectRepository: Repository<Subject>,

        @InjectRepository(ClassroomSection)
        private classroomSectionRepository: Repository<ClassroomSection>,

        @InjectRepository(Student)
        private studentRepository: Repository<Student>,

        @InjectRepository(Faculty)
        private facultyRepository: Repository<Faculty>,
    ) {}

    // /**
    //  * Auto tạo classroom khi đăng ký môn thành công
    //  */
    // async autoCreateClassroom(courseId: number, studentId: number): Promise<Classroom> {
    //     // Kiểm tra classroom đã tồn tại chưa
    //     let classroom = await this.classroomRepository.findOne({
    //         where: { course_id: courseId },
    //         relations: ['course', 'course.subject', 'course.teacher']
    //     });

    //     if (!classroom) {
    //         // Tạo classroom mới
    //         const course = await this.courseRepository.findOne({
    //             where: { id: courseId },
    //             relations: ['subject', 'teacher', 'semester']
    //         });

    //         if (!course) {
    //             throw new NotFoundException('Course not found');
    //         }

    //         classroom = await this.createClassroomFromCourse(course);
    //     }

    //     // Thêm sinh viên vào classroom
    //     await this.autoJoinStudent(classroom.id, studentId);

    //     return classroom;
    // }

    /**
     * Tạo classroom từ course
     */
    // private async createClassroomFromCourse(course: any): Promise<Classroom> {
    //     const classCode = this.generateClassCode(course);
    //     const inviteCode = this.generateInviteCode();

    //     const classroom = this.classroomRepository.create({
    //         course_id: course.id,
    //         name: `${course.subject.name} - ${course.class_code}`,
    //         description: `Lớp học online cho môn ${course.subject.name}`,
    //         class_code: classCode,
    //         invite_code: inviteCode,
    //         is_active: true
    //     });

    //     const savedClassroom = await this.classroomRepository.save(classroom);

    //     // Thêm giáo viên vào classroom
    //     await this.addMember(savedClassroom.id, course.teacher_id, ClassroomRole.TEACHER);

    //     return savedClassroom;
    // }

    /**
     * Tự động thêm sinh viên vào classroom
     */
    async autoJoinStudent(classroomId: number, studentId: number): Promise<void> {
        // Kiểm tra đã là thành viên chưa
        const existingMember = await this.memberRepository.findOne({
            where: { 
                classroom_id: classroomId, 
                user_id: studentId 
            }
        });

        if (!existingMember) {
            await this.addMember(classroomId, studentId, ClassroomRole.STUDENT);
        }
    }

    /**
     * Thêm thành viên vào classroom
     */
    private async addMember(classroomId: number, userId: number, role: ClassroomRole): Promise<void> {
        const member = this.memberRepository.create({
            classroom_id: classroomId,
            user_id: userId,
            role: role,
            is_active: true
        });

        await this.memberRepository.save(member);
    }

    /**
     * Tạo classroom thủ công
     */
    // async createClassroom(createDto: CreateClassroomDto, creatorId: number): Promise<ClassroomResponseDto> {
    //     const course = await this.courseRepository.findOne({
    //         where: { id: createDto.course_id },
    //         relations: ['subject', 'teacher', 'semester']
    //     });

    //     if (!course) {
    //         throw new NotFoundException('Course not found');
    //     }

    //     // Kiểm tra quyền tạo classroom (chỉ teacher của course)
    //     if (course.teacher_id !== creatorId) {
    //         throw new ForbiddenException('Only course teacher can create classroom');
    //     }

    //     // Kiểm tra classroom đã tồn tại
    //     const existingClassroom = await this.classroomRepository.findOne({
    //         where: { course_id: createDto.course_id }
    //     });

    //     if (existingClassroom) {
    //         throw new ConflictException('Classroom already exists for this course');
    //     }

    //     const classroom = await this.createClassroomFromCourse(course);
    //     return this.mapToResponseDto(classroom);
    // }

    private formatSemesterName(semester: string): string {
        // Input format: "HK1 2025-2026"
        // Output format: "HK1_2025"
        const [term, years] = semester.split(' ');
        const startYear = years.split('-')[0];
        return `${term}_${startYear}`;
    }

    private async getNextSectionNumber(subject_id: number, semester: string): Promise<number> {
        // Get all classrooms for this subject in this semester
        const classrooms = await this.classroomRepository.find({
            where: {
                subject: { id: subject_id },
                semester: semester
            },
            order: { name: 'DESC' } // Order by name descending to get the latest N number
        });

        if (classrooms.length === 0) {
            return 1; // First section
        }

        // Find the highest N number
        let maxN = 1;
        for (const classroom of classrooms) {
            const match = classroom.name.match(/_N(\d+)$/);
            if (match) {
                const nNumber = parseInt(match[1]);
                if (nNumber > maxN) {
                    maxN = nNumber;
                }
            }
        }

        return maxN + 1;
    }

    async createClassroom(createDto: CreateClassroomDto): Promise<Classroom> {
        // Get subject information to get credits and name
        const subject = await this.subjectRepository.findOne({
            where: { id: createDto.subject_id }
        });

        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        // Format semester name
        const formattedSemester = this.formatSemesterName(createDto.semester);

        // Get next section number (N1, N2, etc.)
        const nextN = await this.getNextSectionNumber(createDto.subject_id, createDto.semester);

        // Generate classroom name if not provided
        const name = createDto.name || `${formattedSemester}_${subject.name}_N${nextN}`;

        let teacher;
        if (createDto.teacher_username) {
            // Get teacher information
            teacher = await this.userRepository.findOne({
                where: { username: createDto.teacher_username }
            });
            if (!teacher) {
                throw new NotFoundException('Teacher not found');
            }
        }

        // Create classroom with subject credits and instructor
        const classroom = this.classroomRepository.create({
            ...createDto,
            name,
            credits: subject.credits,
            enrolled: createDto.enrolled || 0,
            is_active: createDto.is_active ?? true,
            subject: subject,
            instructor: teacher ? teacher.full_name : null
        });

        // Save classroom first to get the ID
        const savedClassroom = await this.classroomRepository.save(classroom);

        // Create classroom schedules if provided
        if (createDto.schedules && createDto.schedules.length > 0) {
            const schedulePromises = createDto.schedules.map(scheduleDto => {
                const schedule = this.classroomScheduleRepository.create({
                    sections: scheduleDto.sections,
                    schedule: scheduleDto.schedule,
                    classroom: savedClassroom
                });
                return this.classroomScheduleRepository.save(schedule);
            });
            await Promise.all(schedulePromises);
        }

        if (teacher) {
            // Add teacher to classroom member
            await this.addMember(savedClassroom.id, teacher.id, ClassroomRole.TEACHER);
        }

        // Get the classroom with schedules
        return this.classroomRepository.findOne({
            where: { id: savedClassroom.id },
            relations: ['schedules']
        });
    }

    async getClassroom(classroomId: number): Promise<Classroom> {
        return this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['schedules', 'subject', 'members', 'members.user']
        });
    }

    async updateClassroom(classroomId: number, updateDto: UpdateClassroomDto): Promise<Classroom> {
        // Get existing classroom
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['schedules']
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        // Update basic classroom info
        if (updateDto.name) classroom.name = updateDto.name;
        if (updateDto.description !== undefined) classroom.description = updateDto.description;
        if (updateDto.location !== undefined) classroom.location = updateDto.location;
        if (updateDto.enrolled !== undefined) classroom.enrolled = updateDto.enrolled;
        if (updateDto.type !== undefined) classroom.type = updateDto.type;
        if (updateDto.start_date !== undefined) classroom.start_date = new Date(updateDto.start_date);
        if (updateDto.end_date !== undefined) classroom.end_date = new Date(updateDto.end_date);
        if (updateDto.is_active !== undefined) classroom.is_active = updateDto.is_active;
        if (updateDto.allow_grade_editing !== undefined) classroom.allow_grade_editing = updateDto.allow_grade_editing;

        // Save classroom changes
        const savedClassroom = await this.classroomRepository.save(classroom);

        // Handle schedules if provided
        if (updateDto.schedules && updateDto.schedules.length > 0) {
            // Get existing schedule IDs
            const existingScheduleIds = classroom.schedules.map(s => s.id);
            
            // Process each schedule in the update DTO
            for (const scheduleDto of updateDto.schedules) {
                if (scheduleDto.id) {
                    // Update existing schedule
                    const existingSchedule = await this.classroomScheduleRepository.findOne({
                        where: { id: scheduleDto.id }
                    });

                    if (existingSchedule) {
                        existingSchedule.sections = scheduleDto.sections;
                        existingSchedule.schedule = scheduleDto.schedule;
                        await this.classroomScheduleRepository.save(existingSchedule);
                        
                        // Remove from existingScheduleIds as it's been processed
                        const index = existingScheduleIds.indexOf(scheduleDto.id);
                        if (index > -1) {
                            existingScheduleIds.splice(index, 1);
                        }
                    }
                } else {
                    // Create new schedule
                    const newSchedule = this.classroomScheduleRepository.create({
                        sections: scheduleDto.sections,
                        schedule: scheduleDto.schedule,
                        classroom: savedClassroom
                    });
                    await this.classroomScheduleRepository.save(newSchedule);
                }
            }

            // Delete schedules that weren't included in the update
            if (existingScheduleIds.length > 0) {
                await this.classroomScheduleRepository.delete(existingScheduleIds);
            }
        }

        // Return updated classroom with schedules
        return this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['schedules']
        });
    }

    async getAvailableUsers(classroomId: number, role?: string, search?: string) {
        // Get classroom with subject and faculty info
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['subject', 'subject.faculty']
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        // Get current member IDs
        const currentMembers = await this.memberRepository.find({
            where: { classroom_id: classroomId }
        });
        const currentMemberIds = currentMembers.map(m => m.user_id);

        // Build query for available users
        let query = this.userRepository.createQueryBuilder('user')
            .where('user.id NOT IN (:...currentMemberIds)', { currentMemberIds: currentMemberIds.length > 0 ? currentMemberIds : [0] })
            .andWhere('user.isActive = :isActive', { isActive: true });

        // Add faculty filter for students - only students from same faculty as the subject
        if (role === UserRole.STUDENT && classroom.subject?.faculty_id) {
            query = query.andWhere('user.faculty_id = :facultyId', { facultyId: classroom.subject.faculty_id });
        }

        // Add role filter if provided
        if (role) {
            query = query.andWhere('user.role = :role', { role });
        }

        // Add search filter if provided
        if (search) {
            query = query.andWhere(
                '(user.username LIKE :search OR user.full_name LIKE :search OR user.email LIKE :search)',
                { search: `%${search}%` }
            );
        }

        // Get users with pagination
        const users = await query
            .select([
                'user.id',
                'user.username',
                'user.full_name',
                'user.email',
                'user.role'
            ])
            .orderBy('user.full_name', 'ASC')
            .getMany();

        return users;
    }

    async addClassroomMembers(classroomId: number, addMemberDto: AddClassroomMemberDto): Promise<ClassroomMemberResponseDto[]> {
        // Check if classroom exists
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId }
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        // Get users by usernames
        const users = await this.userRepository.find({
            where: { username: In(addMemberDto.usernames) }
        });

        if (users.length === 0) {
            throw new NotFoundException('No users found with the provided usernames');
        }

        // Check for existing members
        const existingMembers = await this.memberRepository.find({
            where: {
                classroom_id: classroomId,
                user_id: In(users.map(u => u.id))
            }
        });

        // Filter out users that are already members
        const existingUserIds = existingMembers.map(m => m.user_id);
        const newUsers = users.filter(u => !existingUserIds.includes(u.id));

        if (newUsers.length === 0) {
            throw new ConflictException('All users are already members of this classroom');
        }

        // Create new members
        const newMembers = newUsers.map(user => {
            return this.memberRepository.create({
                classroom_id: classroomId,
                user_id: user.id,
                role: addMemberDto.role,
                is_active: true
            });
        });

        // Save all new members
        const savedMembers = await this.memberRepository.save(newMembers);

        // Return member details with user information
        return savedMembers.map(member => ({
            id: member.id,
            user_id: member.user_id,
            classroom_id: member.classroom_id,
            role: member.role,
            is_active: member.is_active,
            joined_at: member.joined_at,
            user: users.find(u => u.id === member.user_id)
        }));
    }

    async deleteClassroom(classroomId: number) {
        // Xóa thành viên trong lớp
        await this.memberRepository.delete({ classroom_id: classroomId });
    
        // Xóa lịch học
        await this.classroomScheduleRepository.delete({ classroom: { id: classroomId } });
    
        // Xóa section
        await this.classroomSectionRepository.delete({ classroomId: classroomId });
    
        // Cuối cùng mới xóa classroom
        await this.classroomRepository.delete(classroomId);
    }

    async getAllClassrooms() {
        const classrooms = await this.classroomRepository.find({
            relations: ['subject']
        });
        return classrooms;
    }

    /**
     * Lấy danh sách classroom của user
     */
    async getUserClassrooms(userId: number) {
        // Get all active memberships for the user
        const memberships = await this.memberRepository.find({
            where: {
                user_id: userId,
                is_active: true
            },
            relations: ['classroom']
        });

        if (!memberships || memberships.length === 0) {
            return [];
        }

        // Get classroom IDs from memberships
        const classroomIds = memberships.map(m => m.classroom_id);

        // Get full classroom details with all necessary relations
        const classrooms = await this.classroomRepository.find({
            where: {
                id: In(classroomIds)
            },
            relations: [
                'subject',
                'schedules'
            ]
        });

        return classrooms;
    }

    /**
     * Tự động generate dữ liệu course từ subject
     */
    private generateCourseData(subject: any, index: number) {
        const instructors = [
            "Mrs Trần Thị Ngọc",
            "Mrs Trần Thị Ngọc",
            "Mrs Trần Thị Ngọc", 
            "Mrs Trần Thị Ngọc",
            "Mrs Trần Thị Ngọc"
        ];

        const schedules = [
            "Monday",
            "Tuesday", 
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];

        const locations = [
            "C001", "C002", "C003", "C101", "C102", "C103",
            "B201", "B202", "B301", "A101", "A102", "A201"
        ];

        const semesters = [
            "HK1 2025-2026",
            "HK1 2025-2026", 
            "HK1 2025-2026",
            "HK1 2025-2026"
        ];

        const courseTypes = ["main", "elective", "required"];

        // Generate random but deterministic data based on subject id
        const subjectId = subject.id;
        const instructorIndex = (subjectId + index) % instructors.length;
        const scheduleIndex = (subjectId * 2 + index) % schedules.length;
        const locationIndex = (subjectId * 3 + index) % locations.length;
        const semesterIndex = Math.floor(subjectId / 3) % semesters.length;
        const typeIndex = subjectId % courseTypes.length;

        // Generate realistic enrollment numbers (50-300)
        const enrolled = 50 + ((subjectId * 47 + index * 23) % 251);
        
        // Generate rating (3.5-5.0)
        const rating = 3.5 + ((subjectId * 13 + index * 7) % 16) / 10;
        
        // Generate section number (1-5)
        const section = 1 + ((subjectId + index) % 5);

        return {
            id: subject.id,
            name: subject.name,
            code: subject.subject_code,
            description: subject.description,
            instructor: instructors[instructorIndex],
            credits: subject.credits,
            section: section === 3 ? 1 : section,
            schedule: schedules[scheduleIndex],
            location: locations[locationIndex],
            enrolled: enrolled,
            rating: Math.round(rating * 10) / 10, // Round to 1 decimal
            type: courseTypes[typeIndex],
            semester: semesters[semesterIndex],
        };
    }

    /**
     * Lấy chi tiết classroom
     */
    async getClassroomById(classroomId: number, userId: number): Promise<ClassroomResponseDto> {
        // Kiểm tra quyền truy cập
        await this.validateMemberAccess(classroomId, userId);

        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: [
                'course',
                'course.subject',
                'course.teacher',
                'course.semester'
            ]
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        return this.mapToResponseDto(classroom);
    }

    async getClassroomDetail(classroomId: number): Promise<any> {
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: [
                'schedules'
            ]
        });
        
        return [
            {
                id: classroom.id,
                course: classroom,
                section: 1,
                name: "Section 1"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 2,
                name: "Section 2"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 3,
                name: "Section 3"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 4,
                name: "Section 4"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 5,
                name: "Section 5"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 6,
                name: "Section 6"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 7,
                name: "Section 7"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 8,
                name: "Section 8"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 9,
                name: "Section 9"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 10,
                name: "Section 10"
            }
        ]
    }

    /**
     * Tạo post mới (announcement/material)
     */
    async createPost(
        classroomId: number, 
        createDto: CreateClassroomSectionDto,
        file?: Express.Multer.File
    ) {
        // // Kiểm tra quyền tạo post (teacher hoặc assistant)
        // await this.validateTeacherAccess(classroomId, creatorId);

        let uploadedFile = null;
        let filePath = null;

        // Handle single file upload if file is provided
        if (file) {
            try {
                const subfolder = this.fileUploadService.getClassroomFolder(classroomId);
                uploadedFile = await this.fileUploadService.uploadFile(
                    file.buffer,
                    file.originalname,
                    file.mimetype,
                    subfolder
                );

                // Save file information as JSON string
                filePath = JSON.stringify({
                    filename: uploadedFile.filename,
                    originalName: uploadedFile.original_name,
                    fileUrl: uploadedFile.file_url,
                    fileSize: uploadedFile.file_size,
                    mimeType: uploadedFile.mime_type,
                    uploadedAt: uploadedFile.uploaded_at,
                    objectName: uploadedFile.object_name
                });
            } catch (error) {
                throw new Error(`Failed to upload file: ${error.message}`);
            }
        }

        const classroomSection = this.classroomSectionRepository.create({
            classroomId: classroomId,
            classSectionId: createDto.classSectionId ? parseInt(createDto.classSectionId.toString()) : null,
            material: createDto.material,
            type: createDto.type,
            deadline: createDto.deadline,
            content: createDto.content,
            files: filePath
        });

        const savedClassroomSection = await this.classroomSectionRepository.save(classroomSection);

        return {
            ...savedClassroomSection,
            uploadedFile: uploadedFile
        };
    }

    /**
     * Lấy danh sách posts trong classroom
     */
    async getClassroomPosts(classroomId: number) {
        // Kiểm tra quyền truy cập
        // await this.validateMemberAccess(classroomId, userId);

        const classroomSections = await this.classroomSectionRepository.find({
            where: { classroomId: classroomId },
            order: { createdAt: 'DESC' }
        });
        return classroomSections;
    }

    /**
     * Lấy danh sách posts trong classroom nhưng gộp session lại
     */
    async getClassroomPostsBySession(classroomId: number) {
        // Kiểm tra quyền truy cập
        // await this.validateMemberAccess(classroomId, userId);

        const classroomSections = await this.classroomSectionRepository.find({
            where: { classroomId: classroomId },
            order: { createdAt: 'DESC' }
        });

        // Initialize default 10 sections as array
        const sessionPosts = [];
        for (let i = 1; i <= 10; i++) {
            sessionPosts.push({
                id: i,
                name: `Section ${i}`,
                posts: []
            });
        }

        // Add posts to their respective sections
        for (const section of classroomSections) {
            if (section.classSectionId && section.classSectionId <= 10) {
                // Array is 0-based, so subtract 1 from section ID
                sessionPosts[section.classSectionId - 1].posts.push(section);
            }
        }

        return sessionPosts;
    }

    /**
     * Lấy chi tiết một post cụ thể
     */
    async getPostDetail(classroomId: number, postId: number) {
        // Kiểm tra quyền truy cập
        // await this.validateMemberAccess(classroomId, userId);

        const classroomSection = await this.classroomSectionRepository.findOne({
            where: { 
                id: postId,
                classroomId: classroomId 
            }
        });

        if (!classroomSection) {
            throw new NotFoundException('Post not found in this classroom');
        }

        // Parse file information if exists
        let fileInfo = null;
        if (classroomSection.files) {
            try {
                fileInfo = JSON.parse(classroomSection.files);
            } catch (error) {
                console.error('Error parsing file info:', error);
            }
        }

        return {
            ...classroomSection,
            fileInfo: fileInfo
        };
    }

    /**
     * Download file từ post
     */
    async downloadPostFile(classroomId: number, postId: number, res: any) {
        // Lấy thông tin post
        const classroomSection = await this.classroomSectionRepository.findOne({
            where: { 
                id: postId,
                classroomId: classroomId 
            }
        });

        if (!classroomSection) {
            throw new NotFoundException('Post not found in this classroom');
        }

        if (!classroomSection.files) {
            throw new NotFoundException('No file attached to this post');
        }

        let fileInfo;
        console.log(classroomSection.files);
        try {
            fileInfo = JSON.parse(classroomSection.files);
        } catch (error) {
            throw new BadRequestException('Invalid file information');
        }

        try {
            let objectName = fileInfo.objectName;
            
            // Nếu không có objectName (data cũ), extract từ fileUrl
            if (!objectName) {
                try {
                    const url = new URL(fileInfo.fileUrl);
                    const pathWithoutQuery = url.pathname;
                    
                    // Remove bucket name từ path: /university-files/classroom/1/2025/08/filename.doc
                    if (pathWithoutQuery.startsWith('/university-files/')) {
                        objectName = pathWithoutQuery.substring('/university-files/'.length);
                    } else {
                        // Fallback: remove leading slash
                        objectName = pathWithoutQuery.substring(1);
                    }
                } catch (urlError) {
                    throw new BadRequestException('Cannot extract object name from file URL');
                }
            }
            
            if (!objectName) {
                throw new BadRequestException('Object name not found in file information');
            }
            
            // Get file stream từ MinIO
            const fileStream = await this.fileUploadService.getFileStream(objectName);
            
            // Set headers cho download
            res.setHeader('Content-Type', fileInfo.mimeType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.originalName)}"`);
            if (fileInfo.fileSize) {
                res.setHeader('Content-Length', fileInfo.fileSize.toString());
            }
            
            // Pipe stream trực tiếp tới response
            fileStream.pipe(res);
            
        } catch (error) {
            throw new BadRequestException(`Failed to download file: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả file trong classroom
     */
    async getClassroomFiles(classroomId: number) {
        // Lấy tất cả posts có file trong classroom
        const classroomSections = await this.classroomSectionRepository.find({
            where: { 
                classroomId: classroomId,
                files: Not(IsNull()) // Chỉ lấy posts có file
            },
            order: { createdAt: 'DESC' }
        });

        const filesList = [];

        for (const section of classroomSections) {
            if (section.files) {
                try {
                    const fileInfo = JSON.parse(section.files);
                    
                    // Extract objectName nếu không có (backward compatibility)
                    let objectName = fileInfo.objectName;
                    if (!objectName) {
                        try {
                            const url = new URL(fileInfo.fileUrl);
                            const pathWithoutQuery = url.pathname;
                            if (pathWithoutQuery.startsWith('/university-files/')) {
                                objectName = pathWithoutQuery.substring('/university-files/'.length);
                            } else {
                                objectName = pathWithoutQuery.substring(1);
                            }
                        } catch (urlError) {
                            console.error('Error extracting object name:', urlError);
                            continue;
                        }
                    }

                    filesList.push({
                        postId: section.id,
                        postType: section.type,
                        postMaterial: section.material,
                        postContent: section.content,
                        postDeadline: section.deadline,
                        postCreatedAt: section.createdAt,
                        file: {
                            filename: fileInfo.filename,
                            originalName: fileInfo.originalName,
                            fileUrl: fileInfo.fileUrl,
                            fileSize: fileInfo.fileSize,
                            mimeType: fileInfo.mimeType,
                            uploadedAt: fileInfo.uploadedAt,
                            objectName: objectName,
                            downloadUrl: `/classrooms/${classroomId}/posts/${section.id}/download`
                        }
                    });
                } catch (parseError) {
                    console.error('Error parsing file info for section', section.id, parseError);
                    continue;
                }
            }
        }

        return {
            classroomId: classroomId,
            totalFiles: filesList.length,
            files: filesList
        };
    }

    /**
     * Join classroom bằng invite code
     */
    // async joinClassroom(joinDto: JoinClassroomDto, userId: number): Promise<void> {
    //     const classroom = await this.classroomRepository.findOne({
    //         where: { invite_code: joinDto.invite_code }
    //     });

    //     if (!classroom) {
    //         throw new NotFoundException('Invalid invite code');
    //     }

    //     if (!classroom.is_active) {
    //         throw new BadRequestException('Classroom is not active');
    //     }

    //     // Kiểm tra đã là thành viên chưa
    //     const existingMember = await this.memberRepository.findOne({
    //         where: { 
    //             classroom_id: classroom.id, 
    //             user_id: userId 
    //         }
    //     });

    //     if (existingMember) {
    //         throw new ConflictException('Already a member of this classroom');
    //     }

    //     await this.addMember(classroom.id, userId, ClassroomRole.STUDENT);
    // }

    /**
     * Lấy classroom dashboard với đầy đủ thông tin (posts + grades summary)
     */
    async getClassroomDashboard(classroomId: number, userId: number): Promise<any> {
        await this.validateMemberAccess(classroomId, userId);

        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: [
                'course',
                'course.subject',
                'course.teacher',
                'course.semester'
            ]
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        // Get recent posts
        const recentPosts = await this.postRepository.find({
            where: { classroom_id: classroomId },
            relations: ['creator'],
            order: { 
                is_pinned: 'DESC',
                created_at: 'DESC' 
            },
            take: 5 // Latest 5 posts
        });

        // Get member info
        const userMember = await this.memberRepository.findOne({
            where: { classroom_id: classroomId, user_id: userId }
        });

        // Get member count
        const memberCount = await this.memberRepository.count({
            where: { classroom_id: classroomId, is_active: true }
        });

        return {
            classroom: this.mapToResponseDto(classroom),
            user_role: userMember?.role,
            member_count: memberCount,
            recent_posts: recentPosts.map(post => this.mapPostToResponseDto(post)),
            tabs: {
                stream: { available: true, count: recentPosts.length },
                grades: { available: true, count: 0 }, // Will be populated by grades service
                assignments: { available: false, count: 0 }, // Future feature
                members: { available: true, count: memberCount }
            }
        };
    }

    /**
     * Lấy members của classroom với role info
     */
    async getClassroomMembers(classroomId: number): Promise<any> {
        // await this.validateMemberAccess(classroomId, userId);

        const members = await this.memberRepository.find({
            where: { classroom_id: classroomId, is_active: true },
            relations: ['user'],
            order: { role: 'ASC', joined_at: 'ASC' }
        });

        return members.map(member => ({
            id: member.id,
            user_id: member.user_id,
            role: member.role,
            joined_at: member.joined_at,
            is_active: member.is_active,
            user: {
                id: member.user.id,
                username: member.user.username,
                full_name: member.user.full_name,
                email: member.user.email,
            }
        }));
    }

    /**
     * Helper methods
     */
    private generateClassCode(course: any): string {
        const currentYear = new Date().getFullYear();
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${course.class_code}-${currentYear}-${random}`;
    }

    private generateInviteCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

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

    private mapToResponseDto(classroom: any): ClassroomResponseDto {
        return {
            id: classroom.id,
            course_id: classroom.course_id,
            name: classroom.name,
            description: classroom.description,
            class_code: classroom.class_code,
            invite_code: classroom.invite_code,
            is_active: classroom.is_active,
            allow_grade_editing: classroom.allow_grade_editing,
            created_at: classroom.created_at,
            updated_at: classroom.updated_at,
            course: classroom.course ? {
                id: classroom.course.id,
                class_code: classroom.course.class_code,
                subject: {
                    name: classroom.course.subject?.name,
                    code: classroom.course.subject?.code
                },
                teacher: {
                    full_name: classroom.course.teacher?.full_name
                },
                semester: {
                    name: classroom.course.semester?.name
                }
            } : undefined
        };
    }

    private mapPostToResponseDto(post: any): PostResponseDto {
        return {
            id: post.id,
            classroom_id: post.classroom_id,
            title: post.title,
            content: post.content,
            post_type: post.post_type,
            attachments: post.attachments || [],
            created_by: post.created_by,
            is_pinned: post.is_pinned,
            view_count: post.view_count,
            created_at: post.created_at,
            updated_at: post.updated_at,
            creator: {
                id: post.creator?.id,
                full_name: post.creator?.full_name,
                role: post.creator?.role
            },
            classroom: {
                id: post.classroom?.id,
                name: post.classroom?.name,
                class_code: post.classroom?.class_code
            }
        };
    }

    /**
     * Lấy điểm của tất cả học sinh trong classroom
     */
    async importFromExcel(file: Express.Multer.File): Promise<{
        success: number;
        errors: Array<{ row: number; message: string }>;
    }> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);

        const worksheet = workbook.getWorksheet('Classroom Template');
        const subjectSheet = workbook.getWorksheet('Subject Options');
        if (!worksheet || !subjectSheet) {
            throw new BadRequestException('Invalid Excel file: Required sheets not found');
        }

        // Build subject name to ID mapping
        const subjectMapping = new Map<string, number>();
        subjectSheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header
            const [, name, id] = row.values as any[];
            if (name && id) {
                subjectMapping.set(name.toString().trim(), id);
            }
        });

        const errors: Array<{ row: number; message: string }> = [];
        const classroomsToCreate = [];

        // Process each row
        for await (const row of worksheet.getRows(2, worksheet.rowCount)) { // Skip header row
            try {
                const values = row.values as any[];
                if (!values || values.length === 0) continue;

                const [, subject, teacher, semester, location, schedules, startDate, endDate] = values;

                // Skip empty rows
                if (!subject && !teacher && !semester) continue;

                // Validate required fields
                if (!subject) {
                    errors.push({ row: row.number, message: 'Subject is required' });
                    continue;
                }

                if (!teacher) {
                    errors.push({ row: row.number, message: 'Teacher is required' });
                    continue;
                }

                if (!semester) {
                    errors.push({ row: row.number, message: 'Semester is required' });
                    continue;
                }

                // Validate semester format
                const semesterMatch = semester.toString().match(/^HK[1-3] \d{4}-\d{4}$/);
                if (!semesterMatch) {
                    errors.push({ row: row.number, message: 'Invalid semester format. Expected: HK[1-3] YYYY-YYYY (e.g., HK1 2025-2026)' });
                    continue;
                }

                // Get subject ID from mapping
                const subjectName = subject.toString().trim();
                const subjectId = subjectMapping.get(subjectName);
                if (!subjectId) {
                    errors.push({ row: row.number, message: `Subject "${subjectName}" not found in Subject Options sheet` });
                    continue;
                }

                // Validate subject exists in database
                const subjectExists = await this.subjectRepository.findOne({
                    where: { id: subjectId }
                });
                if (!subjectExists) {
                    errors.push({ row: row.number, message: `Subject with ID ${subjectId} not found in database` });
                    continue;
                }

                // Validate teacher username exists
                const teacherExists = await this.userRepository.findOne({
                    where: { 
                        username: teacher.toString().trim(),
                        role: UserRole.TEACHER
                    }
                });
                if (!teacherExists) {
                    errors.push({ row: row.number, message: `Invalid teacher username: ${teacher}` });
                    continue;
                }

                // Parse schedules
                const scheduleList = [];
                if (schedules) {
                    const scheduleItems = schedules.toString().split(',').map(s => s.trim());
                    let hasError = false;
                    for (const item of scheduleItems) {
                        const match = item.match(/^(\d+)(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
                        if (!match) {
                            errors.push({ row: row.number, message: `Invalid schedule format: ${item}. Expected format: [section]Day (e.g., 1Mon, 2Fri)` });
                            hasError = true;
                            break;
                        }
                        scheduleList.push({
                            sections: parseInt(match[1]),
                            schedule: match[2]
                        });
                    }
                    if (hasError) continue;
                }

                // Parse dates
                let parsedStartDate, parsedEndDate;
                if (startDate) {
                    const match = startDate.toString().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (!match) {
                        errors.push({ row: row.number, message: 'Invalid start date format. Expected: DD/MM/YYYY' });
                        continue;
                    }
                    parsedStartDate = `${match[3]}-${match[2]}-${match[1]}`;
                }

                if (endDate) {
                    const match = endDate.toString().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (!match) {
                        errors.push({ row: row.number, message: 'Invalid end date format. Expected: DD/MM/YYYY' });
                        continue;
                    }
                    parsedEndDate = `${match[3]}-${match[2]}-${match[1]}`;
                }

                // Create classroom object
                classroomsToCreate.push({
                    subject_id: subjectId,
                    teacher_username: teacher.toString().trim(),
                    semester: semester.toString().trim(),
                    location: location ? location.toString().trim() : undefined,
                    type: 'main',
                    schedules: scheduleList,
                    start_date: parsedStartDate,
                    end_date: parsedEndDate
                });

            } catch (error) {
                errors.push({ row: row.number, message: `Error processing row: ${error.message}` });
            }
        }

        // Create classrooms
        let successCount = 0;
        if (classroomsToCreate.length > 0) {
            for (const classroomDto of classroomsToCreate) {
                try {
                    await this.createClassroom(classroomDto);
                    successCount++;
                } catch (error) {
                    errors.push({
                        row: classroomsToCreate.indexOf(classroomDto) + 2,
                        message: `Failed to create classroom: ${error.message}`
                    });
                }
            }
        }

        return {
            success: successCount,
            errors: errors
        };
    }

    async downloadExcelTemplate(): Promise<Buffer> {
        // Get all subjects and teachers
        const subjects = await this.subjectRepository.find({
            order: { name: 'ASC' }
        });

        const teachers = await this.userRepository.find({
            where: { role: UserRole.TEACHER },
            order: { full_name: 'ASC' }
        });

        if (subjects.length === 0) {
            throw new NotFoundException('No subjects found. Please create at least one subject first.');
        }

        // Create workbook
        const workbook = new ExcelJS.Workbook();

        // ===== INSTRUCTION SHEET =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT LỚP HỌC',
            '',
            '1. Điền đầy đủ thông tin vào sheet "Classroom Template"',
            '2. Name: Tên lớp học (VD: HK1_2025_Lập trình web_N1)',
            '3. Subject: Chọn môn học từ danh sách trong sheet "Subject Options"',
            '4. Teacher: Chọn giảng viên từ danh sách trong sheet "Teacher Options"',
            '5. Location: Địa điểm học (VD: C001, B203)',
            '6. Type: Loại lớp (main, elective)',
            '7. Schedules: Định dạng [section]Day (VD: 1Mon, 2Fri - section 1 vào thứ 2, section 2 vào thứ 6)',
            '8. Start Date: Ngày bắt đầu (DD/MM/YYYY)',
            '9. End Date: Ngày kết thúc (DD/MM/YYYY)',
            '',
            'LƯU Ý:',
            '- Name, Subject và Teacher là bắt buộc',
            '- Schedules phải theo đúng định dạng [section]Day',
            '- Ngày tháng phải theo định dạng DD/MM/YYYY'
        ];

        instructions.forEach((instruction, index) => {
            const row = instructionSheet.addRow([instruction]);
            if (index === 0) {
                row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
            } else if (instruction.startsWith('LƯU Ý:')) {
                row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
            }
        });

        // ===== MAIN SHEET: Classroom Template =====
        const worksheet = workbook.addWorksheet('Classroom Template');

            worksheet.columns = [
            { header: 'Subject', key: 'subject', width: 40 },
            { header: 'Teacher', key: 'teacher', width: 30 },
            { header: 'Semester', key: 'semester', width: 20 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Schedules', key: 'schedules', width: 30 },
            { header: 'Start Date', key: 'start_date', width: 15 },
            { header: 'End Date', key: 'end_date', width: 15 }
        ];

        // Style header
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add example row
        worksheet.addRow({
            subject: subjects[0].name,
            teacher: teachers[0].username,
            semester: 'HK1 2025-2026',
            location: 'C001',
            schedules: '1Mon, 2Fri',
            start_date: '01/09/2025',
            end_date: '20/11/2025'
        });

        // Style example row
        const exampleRow = worksheet.getRow(2);
        exampleRow.eachCell((cell) => {
            cell.font = { italic: true, color: { argb: '808080' } };
            cell.border = {
                top: { style: 'thin', color: { argb: 'D3D3D3' } },
                left: { style: 'thin', color: { argb: 'D3D3D3' } },
                bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
                right: { style: 'thin', color: { argb: 'D3D3D3' } }
            };
        });

        // ===== SUBJECT OPTIONS SHEET =====
        const subjectSheet = workbook.addWorksheet('Subject Options');
        subjectSheet.columns = [
            { header: 'Subject Name', key: 'subject_name', width: 40 },
            { header: 'Subject ID', key: 'subject_id', width: 15 },
            { header: 'Credits', key: 'credits', width: 10 }
        ];

        // Style header
        const subjectHeaderRow = subjectSheet.getRow(1);
        subjectHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' }
            };
        });

        // Add subject data
        subjects.forEach(subject => {
            subjectSheet.addRow({
                subject_name: subject.name,
                subject_id: subject.id,
                credits: subject.credits
            });
        });

        // ===== TEACHER OPTIONS SHEET =====
        const teacherSheet = workbook.addWorksheet('Teacher Options');
        teacherSheet.columns = [
            { header: 'Full Name', key: 'full_name', width: 40 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Email', key: 'email', width: 40 }
        ];

        // Style header
        const teacherHeaderRow = teacherSheet.getRow(1);
        teacherHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' }
            };
        });

        // Add teacher data
        teachers.forEach(teacher => {
            teacherSheet.addRow({
                full_name: teacher.full_name,
                username: teacher.username,
                email: teacher.email
            });
        });



        // Create buffer and return
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async downloadExcelWithSampleData(): Promise<Buffer> {
        // Get all subjects and teachers
        const subjects = await this.subjectRepository.find({
            order: { name: 'ASC' }
        });

        const teachers = await this.userRepository.find({
            where: { role: UserRole.TEACHER },
            order: { full_name: 'ASC' }
        });

        if (subjects.length === 0) {
            throw new NotFoundException('No subjects found. Please create at least one subject first.');
        }

        if (teachers.length === 0) {
            throw new NotFoundException('No teachers found. Please create at least one teacher first.');
        }

        // Create workbook
        const workbook = new ExcelJS.Workbook();

        // ===== INSTRUCTION SHEET =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT LỚP HỌC',
            '',
            '1. Điền đầy đủ thông tin vào sheet "Classroom Template"',
            '2. Name: Tên lớp học (VD: HK1_2025_Lập trình web_N1)',
            '3. Subject: Chọn môn học từ danh sách trong sheet "Subject Options"',
            '4. Teacher: Chọn giảng viên từ danh sách trong sheet "Teacher Options"',
            '5. Location: Địa điểm học (VD: C001, B203)',
            '6. Type: Loại lớp (main, elective)',
            '7. Schedules: Định dạng [section]Day (VD: 1Mon, 2Fri - section 1 vào thứ 2, section 2 vào thứ 6)',
            '8. Start Date: Ngày bắt đầu (DD/MM/YYYY)',
            '9. End Date: Ngày kết thúc (DD/MM/YYYY)',
            '',
            'LƯU Ý:',
            '- Name, Subject và Teacher là bắt buộc',
            '- Schedules phải theo đúng định dạng [section]Day',
            '- Ngày tháng phải theo định dạng DD/MM/YYYY'
        ];

        instructions.forEach((instruction, index) => {
            const row = instructionSheet.addRow([instruction]);
            if (index === 0) {
                row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
            } else if (instruction.startsWith('LƯU Ý:')) {
                row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
            }
        });

        // ===== MAIN SHEET: Classroom Template =====
        const worksheet = workbook.addWorksheet('Classroom Template');

            worksheet.columns = [
            { header: 'Subject', key: 'subject', width: 40 },
            { header: 'Teacher', key: 'teacher', width: 30 },
            { header: 'Semester', key: 'semester', width: 20 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Schedules', key: 'schedules', width: 30 },
            { header: 'Start Date', key: 'start_date', width: 15 },
            { header: 'End Date', key: 'end_date', width: 15 }
        ];

        // Style header
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Generate sample data
        const sampleData = [];
        subjects.forEach((subject, index) => {
            const teacher = teachers[index % teachers.length];
            const section1 = (index % 5) + 1;
            const section2 = ((index + 2) % 5) + 1;
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
            const day1 = days[index % 5];
            const day2 = days[(index + 2) % 5];

            sampleData.push({
                subject: subject.name,
                teacher: teacher.username,
                semester: 'HK1 2025-2026',
                location: `C${(index + 1).toString().padStart(3, '0')}`,
                schedules: `${section1}${day1}, ${section2}${day2}`,
                start_date: '01/09/2025',
                end_date: '20/11/2025'
            });
        });

        // Add sample data
        sampleData.forEach((data, index) => {
            const row = worksheet.addRow(data);

            // Style for data rows
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'D3D3D3' } },
                    left: { style: 'thin', color: { argb: 'D3D3D3' } },
                    bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
                    right: { style: 'thin', color: { argb: 'D3D3D3' } }
                };
            });

            // Alternate row colors
            if (index % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'F5F5F5' }
                    };
                });
            }
        });

        // ===== SUBJECT OPTIONS SHEET =====
        const subjectSheet = workbook.addWorksheet('Subject Options');
        subjectSheet.columns = [
            { header: 'Subject Name', key: 'subject_name', width: 40 },
            { header: 'Subject ID', key: 'subject_id', width: 15 },
            { header: 'Credits', key: 'credits', width: 10 }
        ];

        // Style header
        const subjectHeaderRow = subjectSheet.getRow(1);
        subjectHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' }
            };
        });

        // Add subject data
        subjects.forEach(subject => {
            subjectSheet.addRow({
                subject_name: subject.name,
                subject_id: subject.id,
                credits: subject.credits
            });
        });

        // ===== TEACHER OPTIONS SHEET =====
        const teacherSheet = workbook.addWorksheet('Teacher Options');
        teacherSheet.columns = [
            { header: 'Full Name', key: 'full_name', width: 40 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Email', key: 'email', width: 40 }
        ];

        // Style header
        const teacherHeaderRow = teacherSheet.getRow(1);
        teacherHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '4472C4' }
            };
        });

        // Add teacher data
        teachers.forEach(teacher => {
            teacherSheet.addRow({
                full_name: teacher.full_name,
                username: teacher.username,
                email: teacher.email
            });
        });



        // Create buffer and return
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async getClassroomGrades(classroomId: number): Promise<ClassroomStudentGradeResponseDto[]> {
        // Lấy tất cả học sinh trong classroom
        const students = await this.memberRepository.find({
            where: { 
                classroom_id: classroomId,
                role: ClassroomRole.STUDENT,
                is_active: true
            },
            relations: ['user']
        });

        const grades = [];

        for (const student of students) {
            // Tìm điểm của học sinh này
            let grade = await this.gradeRepository.findOne({
                where: {
                    classroomId: classroomId,
                    userId: student.user_id
                },
                relations: ['user']
            });

            // Nếu chưa có record điểm, tạo object rỗng
            if (!grade) {
                grades.push({
                    id: null,
                    classroomId: classroomId,
                    userId: student.user_id,
                    qt1Grade: null,
                    qt2Grade: null,
                    midtermGrade: null,
                    finalGrade: null,
                    createdAt: null,
                    updatedAt: null,
                    user: {
                        id: student.user.id,
                        username: student.user.username,
                        full_name: student.user.full_name,
                        email: student.user.email
                    }
                });
            } else {
                grades.push({
                    id: grade.id,
                    classroomId: grade.classroomId,
                    userId: grade.userId,
                    qt1Grade: grade.qt1Grade,
                    qt2Grade: grade.qt2Grade,
                    midtermGrade: grade.midtermGrade,
                    finalGrade: grade.finalGrade,
                    createdAt: grade.createdAt,
                    updatedAt: grade.updatedAt,
                    user: {
                        id: grade.user.id,
                        username: grade.user.username,
                        full_name: grade.user.full_name,
                        email: grade.user.email
                    }
                });
            }
        }

        return grades;
    }

    /**
     * Cập nhật điểm cho một học sinh
     */
    async updateStudentGrade(
        classroomId: number, 
        userId: number, 
        updateDto: UpdateClassroomStudentGradeDto
    ): Promise<ClassroomStudentGradeResponseDto> {
        // Kiểm tra classroom có cho phép sửa điểm không
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId }
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        if (!classroom.allow_grade_editing) {
            throw new ForbiddenException('Grade editing is not allowed for this classroom. Please contact admin to enable this feature.');
        }

        // Kiểm tra học sinh có trong classroom không
        const studentMember = await this.memberRepository.findOne({
            where: {
                classroom_id: classroomId,
                user_id: userId,
                role: ClassroomRole.STUDENT,
                is_active: true
            }
        });

        if (!studentMember) {
            throw new NotFoundException('Student not found in this classroom');
        }

        // Tìm hoặc tạo mới record điểm
        let grade = await this.gradeRepository.findOne({
            where: {
                classroomId: classroomId,
                userId: userId
            }
        });

        if (!grade) {
            // Tạo mới nếu chưa có
            grade = this.gradeRepository.create({
                classroomId: classroomId,
                userId: userId,
                qt1Grade: updateDto.qt1Grade,
                qt2Grade: updateDto.qt2Grade,
                midtermGrade: updateDto.midtermGrade,
                finalGrade: updateDto.finalGrade
            });
        } else {
            // Cập nhật nếu đã có
            if (updateDto.qt1Grade !== undefined) grade.qt1Grade = updateDto.qt1Grade;
            if (updateDto.qt2Grade !== undefined) grade.qt2Grade = updateDto.qt2Grade;
            if (updateDto.midtermGrade !== undefined) grade.midtermGrade = updateDto.midtermGrade;
            if (updateDto.finalGrade !== undefined) grade.finalGrade = updateDto.finalGrade;
        }

        const savedGrade = await this.gradeRepository.save(grade);

        // Lấy thông tin user
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        return {
            id: savedGrade.id,
            classroomId: savedGrade.classroomId,
            userId: savedGrade.userId,
            qt1Grade: savedGrade.qt1Grade,
            qt2Grade: savedGrade.qt2Grade,
            midtermGrade: savedGrade.midtermGrade,
            finalGrade: savedGrade.finalGrade,
            createdAt: savedGrade.createdAt,
            updatedAt: savedGrade.updatedAt,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email
            }
        };
    }

    // =============== STUDENT EXCEL IMPORT METHODS ===============

    /**
     * Download Excel template for student import
     */
    async downloadStudentExcelTemplate(classroomId: number): Promise<Buffer> {
        // Kiểm tra classroom tồn tại
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['subject', 'subject.faculty']
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        const workbook = new ExcelJS.Workbook();

        // ===== INSTRUCTION SHEET =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT SINH VIÊN VÀO LỚP HỌC',
            '',
            '1. Chỉ sinh viên thuộc cùng khoa với môn học mới có thể được thêm vào lớp',
            `2. Khoa của môn học này: ${classroom.subject?.faculty?.name || 'N/A'}`,
            '3. Xem danh sách đầy đủ sinh viên đủ điều kiện trong sheet "Eligible Students List"',
            '4. Copy username từ sheet đó sang sheet "Student Template"',
            '5. Cột "username" là bắt buộc - đây là username của sinh viên trong hệ thống',
            '6. Các cột khác là tùy chọn, hệ thống sẽ tự động lấy từ database',
            '7. Không được xóa header row (dòng đầu tiên)',
            '8. Lưu file và upload để import',
            '',
            'CÁC SHEET TRONG FILE:',
            '- "Hướng dẫn": Sheet này',
            '- "Student Template": Sheet để điền dữ liệu import',
            '- "Eligible Students List": TẤT CẢ sinh viên đủ điều kiện thêm',
            '',
            'LƯU Ý:',
            '- Sinh viên phải đã tồn tại trong hệ thống',
            '- Sinh viên phải thuộc khoa phù hợp',
            '- Sinh viên đã có trong lớp sẽ bị bỏ qua',
        ];

        instructions.forEach((instruction, index) => {
            const row = instructionSheet.getRow(index + 1);
            row.getCell(1).value = instruction;
            
            if (index === 0) {
                row.getCell(1).font = { bold: true, size: 14 };
            } else if (instruction.startsWith('LƯU Ý:')) {
                row.getCell(1).font = { bold: true, color: { argb: 'FFFF0000' } };
            } else if (instruction.startsWith('CÁC SHEET TRONG FILE:')) {
                row.getCell(1).font = { bold: true, color: { argb: 'FF0000FF' } };
            }
        });

        // ===== STUDENT TEMPLATE SHEET =====
        const templateSheet = workbook.addWorksheet('Student Template');
        
        // Headers
        const headers = ['username', 'full_name', 'email', 'student_code'];
        const headerRow = templateSheet.getRow(1);
        
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Set column widths
        templateSheet.getColumn(1).width = 20; // username
        templateSheet.getColumn(2).width = 30; // full_name
        templateSheet.getColumn(3).width = 30; // email
        templateSheet.getColumn(4).width = 15; // student_code

        // Add some sample rows for guidance
        const sampleRow = templateSheet.getRow(2);
        sampleRow.getCell(1).value = 'student001';
        sampleRow.getCell(2).value = 'Nguyễn Văn A';
        sampleRow.getCell(3).value = 'student001@university.edu.vn';
        sampleRow.getCell(4).value = 'SV001';

        // Style sample row
        for (let i = 1; i <= 4; i++) {
            sampleRow.getCell(i).font = { italic: true, color: { argb: 'FF808080' } };
        }

        // ===== ELIGIBLE STUDENTS LIST SHEET =====
        const eligibleSheet = workbook.addWorksheet('Eligible Students List');
        
        // Get ALL eligible students (not limited to 20)
        const allEligibleStudents = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('classroom_members', 'cm', 'cm.user_id = user.id AND cm.classroom_id = :classroomId', { classroomId })
            .leftJoin('faculties', 'faculty', 'faculty.id = user.faculty_id')
            .where('user.role = :role', { role: UserRole.STUDENT })
            .andWhere('user.faculty_id = :facultyId', { facultyId: classroom.subject?.faculty_id })
            .andWhere('cm.id IS NULL') // Chưa có trong classroom
            .andWhere('user.isActive = :isActive', { isActive: true })
            .select([
                'user.id',
                'user.username', 
                'user.full_name', 
                'user.email',
                'faculty.name'
            ])
            .orderBy('user.full_name', 'ASC')
            .getMany();

        // Add title row
        const titleRow = eligibleSheet.getRow(1);
        const titleCell = titleRow.getCell(1);
        titleCell.value = `DANH SÁCH TẤT CẢ SINH VIÊN ĐỦ ĐIỀU KIỆN THÊM VÀO LỚP (Khoa: ${classroom.subject?.faculty?.name || 'N/A'})`;
        titleCell.font = { bold: true, size: 12, color: { argb: 'FF000080' } };
        eligibleSheet.mergeCells('A1:E1');

        // Add note row
        const noteRow = eligibleSheet.getRow(2);
        noteRow.getCell(1).value = 'LƯU Ý: Copy username từ danh sách này sang sheet "Student Template" để import';
        noteRow.getCell(1).font = { italic: true, color: { argb: 'FFFF0000' } };
        eligibleSheet.mergeCells('A2:E2');

        // Add header row at row 3
        const eligibleHeaders = ['STT', 'username', 'full_name', 'email', 'faculty_name'];
        const eligibleHeaderRow = eligibleSheet.getRow(3);
        eligibleHeaders.forEach((header, index) => {
            const cell = eligibleHeaderRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add all eligible students data
        allEligibleStudents.forEach((student, index) => {
            const row = eligibleSheet.getRow(index + 4); // Start from row 4
            row.getCell(1).value = index + 1; // STT
            row.getCell(2).value = student.username;
            row.getCell(3).value = student.full_name;
            row.getCell(4).value = student.email;
            row.getCell(5).value = classroom.subject?.faculty?.name || 'N/A';

            // Add border to all cells
            for (let i = 1; i <= 5; i++) {
                row.getCell(i).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        });

        eligibleSheet.getColumn(1).width = 8; // STT
        eligibleSheet.getColumn(2).width = 20; // username
        eligibleSheet.getColumn(3).width = 30; // full_name
        eligibleSheet.getColumn(4).width = 30; // email
        eligibleSheet.getColumn(5).width = 25; // faculty_name

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Download Excel with sample data for student import
     */
    async downloadStudentExcelWithSampleData(classroomId: number): Promise<Buffer> {
        // Kiểm tra classroom tồn tại
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['subject', 'subject.faculty']
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        // Lấy danh sách sinh viên thuộc khoa của môn học, chưa có trong lớp
        const facultyId = classroom.subject?.faculty_id;
        if (!facultyId) {
            throw new BadRequestException('Subject faculty information is missing');
        }

        // Lấy sinh viên thuộc khoa này và chưa có trong classroom
        const availableStudents = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('classroom_members', 'cm', 'cm.user_id = user.id AND cm.classroom_id = :classroomId', { classroomId })
            .where('user.role = :role', { role: UserRole.STUDENT })
            .andWhere('user.faculty_id = :facultyId', { facultyId })
            .andWhere('cm.id IS NULL') // Chưa có trong classroom
            .andWhere('user.isActive = :isActive', { isActive: true })
            .limit(20) // Lấy 20 sinh viên mẫu
            .getMany();

        const workbook = new ExcelJS.Workbook();

        // ===== INSTRUCTION SHEET =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT SINH VIÊN VÀO LỚP HỌC',
            '',
            '1. File này chứa dữ liệu mẫu của sinh viên có thể thêm vào lớp',
            `2. Khoa của môn học: ${classroom.subject?.faculty?.name || 'N/A'}`,
            '3. Xem danh sách đầy đủ sinh viên đủ điều kiện trong sheet "Eligible Students List"',
            '4. Chọn sinh viên từ sheet "Student Sample Data" (20 sinh viên mẫu)',
            '5. Copy username từ danh sách sang sheet "Student Template"',
            '6. Chỉnh sửa thông tin nếu cần và upload file để import',
            '',
            'CÁC SHEET TRONG FILE:',
            '- "Hướng dẫn": Sheet này',
            '- "Student Template": Sheet để điền dữ liệu import', 
            '- "Student Sample Data": 20 sinh viên mẫu',
            '- "Eligible Students List": TẤT CẢ sinh viên đủ điều kiện',
            '',
            'LƯU Ý:',
            '- Chỉ sinh viên thuộc cùng khoa mới được thêm',
            '- Sinh viên đã có trong lớp sẽ không xuất hiện trong danh sách',
        ];

        instructions.forEach((instruction, index) => {
            const row = instructionSheet.getRow(index + 1);
            row.getCell(1).value = instruction;
            
            if (index === 0) {
                row.getCell(1).font = { bold: true, size: 14 };
            } else if (instruction.startsWith('LƯU Ý:')) {
                row.getCell(1).font = { bold: true, color: { argb: 'FFFF0000' } };
            }
        });

        
        // ===== STUDENT SAMPLE DATA SHEET =====
        const sampleSheet = workbook.addWorksheet('Student Template');
        const headers = ['username', 'full_name', 'email', 'student_code'];
        
        const sampleHeaderRow = sampleSheet.getRow(1);
        headers.forEach((header, index) => {
            const cell = sampleHeaderRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
        });

        // Add sample student data
        availableStudents.forEach((student, index) => {
            const row = sampleSheet.getRow(index + 2);
            row.getCell(1).value = student.username;
            row.getCell(2).value = student.full_name;
            row.getCell(3).value = student.email;
            row.getCell(4).value = student.username; // Placeholder for student_code
        });

        sampleSheet.getColumn(1).width = 20;
        sampleSheet.getColumn(2).width = 30;
        sampleSheet.getColumn(3).width = 30;
        sampleSheet.getColumn(4).width = 15;

        // ===== ELIGIBLE STUDENTS LIST SHEET =====
        const eligibleSheet = workbook.addWorksheet('Eligible Students List');
        
        // Get ALL eligible students (not limited to 20)
        const allEligibleStudents = await this.userRepository
            .createQueryBuilder('user')
            .leftJoin('classroom_members', 'cm', 'cm.user_id = user.id AND cm.classroom_id = :classroomId', { classroomId })
            .leftJoin('faculties', 'faculty', 'faculty.id = user.faculty_id')
            .where('user.role = :role', { role: UserRole.STUDENT })
            .andWhere('user.faculty_id = :facultyId', { facultyId })
            .andWhere('cm.id IS NULL') // Chưa có trong classroom
            .andWhere('user.isActive = :isActive', { isActive: true })
            .select([
                'user.id',
                'user.username', 
                'user.full_name', 
                'user.email',
                'faculty.name'
            ])
            .orderBy('user.full_name', 'ASC')
            .getMany();

        const eligibleHeaderRow = eligibleSheet.getRow(1);
        const eligibleHeaders = ['STT', 'username', 'full_name', 'email', 'faculty_name'];
        eligibleHeaders.forEach((header, index) => {
            const cell = eligibleHeaderRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add title row
        const titleRow = eligibleSheet.getRow(0);
        const titleCell = titleRow.getCell(1);
        titleCell.value = `DANH SÁCH TẤT CẢ SINH VIÊN ĐỦ ĐIỀU KIỆN THÊM VÀO LỚP (Khoa: ${classroom.subject?.faculty?.name || 'N/A'})`;
        titleCell.font = { bold: true, size: 12, color: { argb: 'FF000080' } };
        eligibleSheet.mergeCells('A1:E1');

        // Add note row
        const noteRow = eligibleSheet.getRow(2);
        noteRow.getCell(1).value = 'LƯU Ý: Copy username từ danh sách này sang sheet "Student Template" để import';
        noteRow.getCell(1).font = { italic: true, color: { argb: 'FFFF0000' } };
        eligibleSheet.mergeCells('A2:E2');

        // Adjust header row to be row 3
        const newHeaderRow = eligibleSheet.getRow(3);
        eligibleHeaders.forEach((header, index) => {
            const cell = newHeaderRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add all eligible students data
        allEligibleStudents.forEach((student, index) => {
            const row = eligibleSheet.getRow(index + 4); // Start from row 4
            row.getCell(1).value = index + 1; // STT
            row.getCell(2).value = student.username;
            row.getCell(3).value = student.full_name;
            row.getCell(4).value = student.email;
            row.getCell(5).value = classroom.subject?.faculty?.name || 'N/A';

            // Add border to all cells
            for (let i = 1; i <= 5; i++) {
                row.getCell(i).border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        });

        eligibleSheet.getColumn(1).width = 8; // STT
        eligibleSheet.getColumn(2).width = 20; // username
        eligibleSheet.getColumn(3).width = 30; // full_name
        eligibleSheet.getColumn(4).width = 30; // email
        eligibleSheet.getColumn(5).width = 25; // faculty_name

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Import students from Excel to classroom
     */
    async importStudentsFromExcel(
        classroomId: number, 
        file: Express.Multer.File
    ): Promise<ImportStudentResponseDto> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Kiểm tra classroom tồn tại
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: ['subject', 'subject.faculty']
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        const facultyId = classroom.subject?.faculty_id;
        if (!facultyId) {
            throw new BadRequestException('Subject faculty information is missing');
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);

        const worksheet = workbook.getWorksheet('Student Template');
        if (!worksheet) {
            throw new BadRequestException('Invalid Excel file: "Student Template" sheet not found');
        }

        const errors: Array<{ row: number; username: string; message: string }> = [];
        const importedStudents: Array<{
            username: string;
            full_name: string;
            email: string;
            role: string;
        }> = [];

        let successCount = 0;

        // Process each row (skip header)
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const username = row.getCell(1).value?.toString().trim();

            // Skip empty rows
            if (!username) continue;

            try {
                // Tìm user trong database
                const user = await this.userRepository
                    .createQueryBuilder('user')
                    .where('user.username = :username', { username })
                    .andWhere('user.role = :role', { role: UserRole.STUDENT })
                    .andWhere('user.isActive = :isActive', { isActive: true })
                    .select(['user.id', 'user.username', 'user.full_name', 'user.email', 'user.faculty_id'])
                    .getOne();

                if (!user) {
                    errors.push({
                        row: rowNumber,
                        username,
                        message: 'Sinh viên không tồn tại hoặc không có quyền student'
                    });
                    continue;
                }

                // Kiểm tra sinh viên có thuộc khoa của môn học không
                if (!user.faculty_id || user.faculty_id !== facultyId) {
                    const facultyName = classroom.subject?.faculty?.name || 'Unknown';
                    errors.push({
                        row: rowNumber,
                        username,
                        message: `Sinh viên không thuộc khoa ${facultyName}`
                    });
                    continue;
                }

                // Kiểm tra sinh viên đã có trong classroom chưa
                const existingMember = await this.memberRepository.findOne({
                    where: {
                        classroom_id: classroomId,
                        user_id: user.id,
                        is_active: true
                    }
                });

                if (existingMember) {
                    errors.push({
                        row: rowNumber,
                        username,
                        message: 'Sinh viên đã có trong lớp học'
                    });
                    continue;
                }

                // Thêm sinh viên vào classroom
                const newMember = this.memberRepository.create({
                    classroom_id: classroomId,
                    user_id: user.id,
                    role: ClassroomRole.STUDENT,
                    is_active: true
                });

                await this.memberRepository.save(newMember);

                importedStudents.push({
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    role: ClassroomRole.STUDENT
                });

                successCount++;

            } catch (error) {
                errors.push({
                    row: rowNumber,
                    username,
                    message: `Lỗi xử lý: ${error.message}`
                });
            }
        }

        return {
            success: successCount,
            errors,
            imported_students: importedStudents
        };
    }

    /**
     * Toggle setting cho phép sửa điểm
     */
    async toggleGradeEditing(classroomId: number, allowGradeEditing: boolean): Promise<{ message: string; allow_grade_editing: boolean }> {
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId }
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        classroom.allow_grade_editing = allowGradeEditing;
        await this.classroomRepository.save(classroom);

        return {
            message: `Grade editing has been ${allowGradeEditing ? 'enabled' : 'disabled'} for this classroom`,
            allow_grade_editing: allowGradeEditing
        };
    }
}