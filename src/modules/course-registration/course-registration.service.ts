import { 
    Injectable, 
    NotFoundException, 
    BadRequestException, 
    ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RegisterCourseDto } from './dto/course-registration.dto';
import { Registration } from '../../entities/registration.entity';
import { Course } from '../../entities/course.entity';
import { Student } from '../../entities/student.entity';
import { RegistrationSession } from '../../entities/registration-session.entity';
import { SessionCourse } from '../../entities/session-course.entity';
import { SessionCourseDepartment } from '../../entities/session-course-department.entity';
import { CourseSchedule } from '../../entities/course-schedule.entity';
import { ClassroomService } from '../classroom/classroom.service';
import { RegistrationStatus } from '../../shared/constants/enum';

@Injectable()
export class CourseRegistrationService {
    constructor(
        @InjectRepository(Registration)
        private registrationRepository: Repository<Registration>,
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(RegistrationSession)
        private registrationSessionRepository: Repository<RegistrationSession>,
        @InjectRepository(SessionCourse)
        private sessionCourseRepository: Repository<SessionCourse>,
        @InjectRepository(SessionCourseDepartment)
        private sessionCourseDepartmentRepository: Repository<SessionCourseDepartment>,
        @InjectRepository(CourseSchedule)
        private courseScheduleRepository: Repository<CourseSchedule>,
        private dataSource: DataSource,
        
        private classroomService: ClassroomService,
    ) {}

    /**
     * Đăng ký môn học cho sinh viên với đầy đủ validation
     */
    async registerCourse(registerDto: RegisterCourseDto): Promise<Registration> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Validate student exists and get faculty info
            const student = await this.validateAndGetStudent(registerDto.student_id);
            
            // 2. Validate registration session and check deadline
            const registrationSession = await this.validateRegistrationSession(registerDto.registration_session_id);
            
            // 3. Validate course exists and get full info
            const course = await this.validateAndGetCourse(registerDto.course_id);
            
            // 4. Check if session course exists and is available
            const sessionCourse = await this.validateSessionCourse(
                registerDto.registration_session_id, 
                registerDto.course_id
            );
            
            // 5. Check faculty permission
            await this.validateFacultyPermission(sessionCourse.id, student.classes.major.faculty.id);
            
            // 6. Check course capacity
            this.validateCourseCapacity(course);
            
            // 7. Check duplicate registration
            await this.validateDuplicateRegistration(registerDto.student_id, registerDto.course_id);
            
            // 8. Check schedule conflicts
            await this.validateScheduleConflicts(registerDto.student_id, course.id, registerDto.registration_session_id);
            
            // 9. Create registration record
            const registration = queryRunner.manager.create(Registration, {
                student_id: registerDto.student_id,
                course_id: registerDto.course_id,
                registration_session_id: registerDto.registration_session_id,
                status: RegistrationStatus.CONFIRMED,
                registered_at: new Date(),
                notes: registerDto.notes,
            });
            
            const savedRegistration = await queryRunner.manager.save(Registration, registration);
            
            // 10. Update course current_students count
            await queryRunner.manager.increment(Course, { id: registerDto.course_id }, 'current_students', 1);
            
            await queryRunner.commitTransaction();
            
            // 11. Auto-create/join classroom after successful registration
            try {
                await this.classroomService.autoCreateClassroom(registerDto.course_id, registerDto.student_id);
            } catch (classroomError) {
                // Log error but don't fail the registration
                console.warn('Failed to auto-create classroom:', classroomError.message);
            }
            
            // Return with relations
            return await this.findRegistrationWithDetails(savedRegistration.id);
            
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Validate student exists and get with faculty info
     */
    private async validateAndGetStudent(studentId: number): Promise<Student> {
        const student = await this.studentRepository.findOne({
            where: { id: studentId },
            relations: ['classes', 'classes.major', 'classes.major.faculty'],
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${studentId} not found`);
        }

        if (!student.classes?.major?.faculty) {
            throw new BadRequestException('Student must belong to a class with valid major and faculty');
        }

        return student;
    }

    /**
     * Validate registration session and check deadline
     */
    private async validateRegistrationSession(sessionId: number): Promise<RegistrationSession> {
        const session = await this.registrationSessionRepository.findOne({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException(`Registration session with ID ${sessionId} not found`);
        }

        if (!session.is_active) {
            throw new BadRequestException('Registration session is not active');
        }

        const now = new Date();
        if (now > session.end_date) {
            throw new BadRequestException('Registration deadline has passed');
        }

        if (now < session.start_date) {
            throw new BadRequestException('Registration has not started yet');
        }

        return session;
    }

    /**
     * Validate course exists and get with schedules
     */
    private async validateAndGetCourse(courseId: number): Promise<Course> {
        const course = await this.courseRepository.findOne({
            where: { id: courseId },
            relations: ['subject', 'teacher', 'schedules'],
        });

        if (!course) {
            throw new NotFoundException(`Course with ID ${courseId} not found`);
        }

        return course;
    }

    /**
     * Validate session course exists and is available
     */
    private async validateSessionCourse(sessionId: number, courseId: number): Promise<SessionCourse> {
        const sessionCourse = await this.sessionCourseRepository.findOne({
            where: { 
                registration_session_id: sessionId,
                course_id: courseId 
            },
        });

        if (!sessionCourse) {
            throw new NotFoundException('Course is not available in this registration session');
        }

        if (!sessionCourse.is_available) {
            throw new BadRequestException('Course registration is currently disabled');
        }

        return sessionCourse;
    }

    /**
     * Validate faculty permission to register for this course
     */
    private async validateFacultyPermission(sessionCourseId: number, studentFacultyId: number): Promise<void> {
        const allowedDepartment = await this.sessionCourseDepartmentRepository.findOne({
            where: {
                session_course_id: sessionCourseId,
                faculty_id: studentFacultyId,
            },
        });

        if (!allowedDepartment) {
            throw new BadRequestException('Your faculty is not allowed to register for this course');
        }
    }

    /**
     * Check if course has available slots
     */
    private validateCourseCapacity(course: Course): void {
        if (course.current_students >= course.max_students) {
            throw new ConflictException('Course is full. No available slots');
        }
    }

    /**
     * Check if student already registered for this course
     */
    private async validateDuplicateRegistration(studentId: number, courseId: number): Promise<void> {
        const existingRegistration = await this.registrationRepository.findOne({
            where: {
                student_id: studentId,
                course_id: courseId,
                status: RegistrationStatus.CONFIRMED,
            },
        });

        if (existingRegistration) {
            throw new ConflictException('Student is already registered for this course');
        }
    }

    /**
     * Check for schedule conflicts with existing registrations
     */
    private async validateScheduleConflicts(studentId: number, newCourseId: number, sessionId: number): Promise<void> {
        // Get all confirmed registrations for this student in the same session
        const existingRegistrations = await this.registrationRepository.find({
            where: {
                student_id: studentId,
                registration_session_id: sessionId,
                status: RegistrationStatus.CONFIRMED,
            },
            relations: ['course', 'course.schedules'],
        });

        // Get schedules for the new course
        const newCourseSchedules = await this.courseScheduleRepository.find({
            where: { course_id: newCourseId },
        });

        // Check for conflicts
        for (const existingReg of existingRegistrations) {
            for (const existingSchedule of existingReg.course.schedules) {
                for (const newSchedule of newCourseSchedules) {
                    if (this.hasScheduleConflict(existingSchedule, newSchedule)) {
                        throw new ConflictException(
                            `Schedule conflict detected with course ${existingReg.course.class_code} ` +
                            `on ${this.getDayName(newSchedule.day_of_week)} ` +
                            `periods ${newSchedule.period_start}-${newSchedule.period_end}`
                        );
                    }
                }
            }
        }
    }

    /**
     * Check if two schedules conflict
     */
    private hasScheduleConflict(schedule1: CourseSchedule, schedule2: CourseSchedule): boolean {
        // Different days = no conflict
        if (schedule1.day_of_week !== schedule2.day_of_week) {
            return false;
        }

        // Check week overlap
        const week1Start = schedule1.week_start;
        const week1End = schedule1.week_end;
        const week2Start = schedule2.week_start;
        const week2End = schedule2.week_end;

        const weekOverlap = !(week1End < week2Start || week2End < week1Start);
        if (!weekOverlap) {
            return false;
        }

        // Check period overlap
        const period1Start = schedule1.period_start;
        const period1End = schedule1.period_end;
        const period2Start = schedule2.period_start;
        const period2End = schedule2.period_end;

        const periodOverlap = !(period1End < period2Start || period2End < period1Start);
        
        return periodOverlap;
    }

    /**
     * Get day name from day number
     */
    private getDayName(dayOfWeek: number): string {
        const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayOfWeek] || 'Unknown';
    }

    /**
     * Find registration with full details
     */
    async findRegistrationWithDetails(registrationId: number): Promise<Registration> {
        return await this.registrationRepository.findOne({
            where: { id: registrationId },
            relations: [
                'student',
                'student.classes',
                'student.classes.major',
                'student.classes.major.faculty',
                'course',
                'course.subject',
                'course.teacher',
                'course.schedules',
                'registrationSession',
            ],
        });
    }

    /**
     * Cancel registration
     */
    async cancelRegistration(registrationId: number, studentId: number): Promise<Registration> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const registration = await this.registrationRepository.findOne({
                where: { 
                    id: registrationId,
                    student_id: studentId,
                    status: RegistrationStatus.CONFIRMED 
                },
                relations: ['course'],
            });

            if (!registration) {
                throw new NotFoundException('Registration not found or already cancelled');
            }

            // Update status
            registration.status = RegistrationStatus.CANCELLED;
            await queryRunner.manager.save(Registration, registration);

            // Decrease current_students count
            await queryRunner.manager.decrement(Course, { id: registration.course_id }, 'current_students', 1);

            await queryRunner.commitTransaction();

            return await this.findRegistrationWithDetails(registrationId);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * Get student registrations
     */
    async getStudentRegistrations(studentId: number, sessionId?: number): Promise<Registration[]> {
        const where: any = { student_id: studentId };
        if (sessionId) {
            where.registration_session_id = sessionId;
        }

        return await this.registrationRepository.find({
            where,
            relations: [
                'course',
                'course.subject',
                'course.teacher',
                'course.schedules',
                'registrationSession',
            ],
            order: { created_at: 'DESC' },
        });
    }
}