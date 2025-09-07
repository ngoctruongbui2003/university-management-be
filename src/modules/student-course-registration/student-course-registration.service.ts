import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
    RegisterForSubjectDto,
    BatchRegisterSubjectsDto,
    BatchRegisterUsersDto,
    BatchUnregisterUsersDto,
    UpdateRegistrationStatusDto,
    GetRegistrationHistoryDto,
    GetStudentSubjectsBySemesterDto,
    GetStudentsInSubjectDto,
    AvailableSubjectResponseDto,
} from './dto/student-course-registration.dto';
import { StudentCourseRegistration } from '../../entities/student-course-registration.entity';
import { CourseRegistrationSubject } from '../../entities/course-registration-subject.entity';
import { CourseRegistration } from '../../entities/course-registration.entity';
import { User } from '../../entities/user.entity';
import { Subject } from '../../entities/subject.entity';
import { Student } from '../../entities/student.entity';
import { CourseRegistrationClasses } from '../../entities/course-registration-classes.entity';
import { StudentRegistrationStatus, CourseRegistrationStatus, UserRole } from '../../shared/constants/enum';

@Injectable()
export class StudentCourseRegistrationService {
    constructor(
        @InjectRepository(StudentCourseRegistration)
        private studentCourseRegistrationRepository: Repository<StudentCourseRegistration>,
        @InjectRepository(CourseRegistrationSubject)
        private courseRegistrationSubjectRepository: Repository<CourseRegistrationSubject>,
        @InjectRepository(CourseRegistration)
        private courseRegistrationRepository: Repository<CourseRegistration>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Subject)
        private subjectRepository: Repository<Subject>,
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        @InjectRepository(CourseRegistrationClasses)
        private courseRegistrationClassesRepository: Repository<CourseRegistrationClasses>,
        private dataSource: DataSource,
    ) {}

    // =============== Student Registration ===============

    async batchRegisterSubjects(userId: number, batchRegisterDto: BatchRegisterSubjectsDto): Promise<StudentCourseRegistration[]> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate user exists and has STUDENT role
            const user = await this.userRepository.findOne({
                where: { id: userId, role: UserRole.STUDENT },
            });
            if (!user) {
                throw new NotFoundException(`Student user with ID ${userId} not found`);
            }

            // Validate course registration subjects exist
            const courseRegistrationSubjects = await this.courseRegistrationSubjectRepository.find({
                where: { id: In(batchRegisterDto.course_registration_subject_ids) },
                relations: ['subject', 'courseRegistration'],
            });

            if (courseRegistrationSubjects.length !== batchRegisterDto.course_registration_subject_ids.length) {
                throw new NotFoundException('One or more course registration subjects not found');
            }

            // Check if all subjects belong to the same course registration (optional validation)
            const courseRegistrationIds = [...new Set(courseRegistrationSubjects.map(crs => crs.course_registration_id))];
            if (courseRegistrationIds.length > 1) {
                throw new BadRequestException('All subjects must belong to the same course registration');
            }

            // Check if course registration is open
            const courseRegistration = courseRegistrationSubjects[0].courseRegistration;
            if (courseRegistration.status !== CourseRegistrationStatus.OPEN) {
                throw new BadRequestException('Course registration is closed');
            }

            // Check registration period
            const now = new Date();
            if (now < courseRegistration.start_date) {
                throw new BadRequestException('Registration has not started yet');
            }
            if (now > courseRegistration.end_date) {
                throw new BadRequestException('Registration deadline has passed');
            }

            // Get user's existing registrations for this course registration
            const existingRegistrations = await this.studentCourseRegistrationRepository.find({
                where: {
                    user_id: userId,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
                relations: ['courseRegistrationSubject'],
            });

            // Filter existing registrations for the same course registration
            const relevantExistingRegistrations = existingRegistrations.filter(reg => 
                reg.courseRegistrationSubject.course_registration_id === courseRegistration.id
            );

            // Get IDs of currently registered course registration subjects
            const currentlyRegisteredIds = new Set(
                relevantExistingRegistrations.map(reg => reg.course_registration_subject_id)
            );

            // Get IDs from the new request
            const newRequestIds = new Set(batchRegisterDto.course_registration_subject_ids);

            // Determine what to keep, add, and remove
            const toKeep = relevantExistingRegistrations.filter(reg => 
                newRequestIds.has(reg.course_registration_subject_id)
            );
            
            const toRemove = relevantExistingRegistrations.filter(reg => 
                !newRequestIds.has(reg.course_registration_subject_id)
            );
            
            const toAddIds = batchRegisterDto.course_registration_subject_ids.filter(id => 
                !currentlyRegisteredIds.has(id)
            );

            // Remove registrations not in the new list
            if (toRemove.length > 0) {
                await queryRunner.manager.remove(StudentCourseRegistration, toRemove);
            }

            // Add new registrations
            const newRegistrations = [];
            for (const courseRegSubjectId of toAddIds) {
                const courseRegSubject = courseRegistrationSubjects.find(crs => crs.id === courseRegSubjectId);
                
                // Check capacity
                const currentRegistrations = await this.studentCourseRegistrationRepository.count({
                    where: {
                        course_registration_subject_id: courseRegSubjectId,
                        status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                    },
                });

                if (currentRegistrations >= courseRegSubject.max_student) {
                    throw new ConflictException(`Subject "${courseRegSubject.subject.name}" is full. No available slots`);
                }

                const newRegistration = queryRunner.manager.create(StudentCourseRegistration, {
                    user_id: userId,
                    course_registration_subject_id: courseRegSubjectId,
                    status: StudentRegistrationStatus.APPROVED,
                    registered_at: new Date(),
                    notes: batchRegisterDto.notes,
                });

                newRegistrations.push(newRegistration);
            }

            // Save new registrations
            if (newRegistrations.length > 0) {
                await queryRunner.manager.save(StudentCourseRegistration, newRegistrations);
            }

            await queryRunner.commitTransaction();

            // Return all current registrations for this course registration
            const finalRegistrations = await this.studentCourseRegistrationRepository.find({
                where: {
                    user_id: userId,
                    course_registration_subject_id: In(batchRegisterDto.course_registration_subject_ids),
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
                relations: [
                    'user',
                    'courseRegistrationSubject',
                    'courseRegistrationSubject.subject',
                    'courseRegistrationSubject.courseRegistration',
                    'courseRegistrationSubject.courseRegistration.semester',
                    'courseRegistrationSubject.courseRegistrationSchedules',
                ],
            });

            return finalRegistrations;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async batchRegisterUsersForSubjects(batchRegisterUsersDto: BatchRegisterUsersDto): Promise<StudentCourseRegistration[]> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate all users exist and have STUDENT role
            const users = await this.userRepository.find({
                where: { 
                    id: In(batchRegisterUsersDto.user_ids), 
                    role: UserRole.STUDENT 
                },
            });

            if (users.length !== batchRegisterUsersDto.user_ids.length) {
                const foundUserIds = users.map(u => u.id);
                const missingUserIds = batchRegisterUsersDto.user_ids.filter(id => !foundUserIds.includes(id));
                throw new NotFoundException(`Student users with IDs ${missingUserIds.join(', ')} not found`);
            }

            // Validate course registration subject exists
            const courseRegistrationSubject = await this.courseRegistrationSubjectRepository.findOne({
                where: { id: batchRegisterUsersDto.course_registration_subject_id },
                relations: ['subject', 'courseRegistration'],
            });

            if (!courseRegistrationSubject) {
                throw new NotFoundException(`Course registration subject with ID ${batchRegisterUsersDto.course_registration_subject_id} not found`);
            }

            // Check if course registration is open
            const courseRegistration = courseRegistrationSubject.courseRegistration;
            if (courseRegistration.status !== CourseRegistrationStatus.OPEN) {
                throw new BadRequestException('Course registration is closed');
            }

            // Check registration period
            const now = new Date();
            if (now < courseRegistration.start_date) {
                throw new BadRequestException('Registration has not started yet');
            }
            if (now > courseRegistration.end_date) {
                throw new BadRequestException('Registration deadline has passed');
            }

            // Get existing registrations for these users in this subject
            const existingRegistrations = await this.studentCourseRegistrationRepository.find({
                where: {
                    user_id: In(batchRegisterUsersDto.user_ids),
                    course_registration_subject_id: batchRegisterUsersDto.course_registration_subject_id,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
            });

            // Get IDs of users who are already registered
            const alreadyRegisteredUserIds = new Set(existingRegistrations.map(reg => reg.user_id));

            // Filter out users who are already registered
            const usersToRegister = batchRegisterUsersDto.user_ids.filter(userId => 
                !alreadyRegisteredUserIds.has(userId)
            );

            if (usersToRegister.length === 0) {
                // All users are already registered
                const allRegistrations = await this.studentCourseRegistrationRepository.find({
                    where: {
                        user_id: In(batchRegisterUsersDto.user_ids),
                        course_registration_subject_id: batchRegisterUsersDto.course_registration_subject_id,
                        status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                    },
                    relations: [
                        'user',
                        'courseRegistrationSubject',
                        'courseRegistrationSubject.subject',
                        'courseRegistrationSubject.courseRegistration',
                        'courseRegistrationSubject.courseRegistration.semester',
                        'courseRegistrationSubject.courseRegistrationSchedules',
                    ],
                });
                return allRegistrations;
            }

            // Check capacity
            const currentRegistrations = await this.studentCourseRegistrationRepository.count({
                where: {
                    course_registration_subject_id: batchRegisterUsersDto.course_registration_subject_id,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
            });

            const availableSlots = courseRegistrationSubject.max_student - currentRegistrations;
            if (usersToRegister.length > availableSlots) {
                throw new ConflictException(
                    `Subject "${courseRegistrationSubject.subject.name}" only has ${availableSlots} available slots, but trying to register ${usersToRegister.length} users`
                );
            }

            // Create new registrations
            const newRegistrations = usersToRegister.map(userId => 
                queryRunner.manager.create(StudentCourseRegistration, {
                    user_id: userId,
                    course_registration_subject_id: batchRegisterUsersDto.course_registration_subject_id,
                    status: StudentRegistrationStatus.APPROVED,
                    registered_at: new Date(),
                    notes: batchRegisterUsersDto.notes,
                })
            );

            // Save all new registrations
            if (newRegistrations.length > 0) {
                await queryRunner.manager.save(StudentCourseRegistration, newRegistrations);
            }

            await queryRunner.commitTransaction();

            // Return all registrations for these users in this subject
            const allRegistrations = await this.studentCourseRegistrationRepository.find({
                where: {
                    user_id: In(batchRegisterUsersDto.user_ids),
                    course_registration_subject_id: batchRegisterUsersDto.course_registration_subject_id,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
                relations: [
                    'user',
                    'courseRegistrationSubject',
                    'courseRegistrationSubject.subject',
                    'courseRegistrationSubject.courseRegistration',
                    'courseRegistrationSubject.courseRegistration.semester',
                    'courseRegistrationSubject.courseRegistrationSchedules',
                ],
            });

            return allRegistrations;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async batchUnregisterUsersFromSubject(batchUnregisterUsersDto: BatchUnregisterUsersDto): Promise<{ message: string; unregistered_count: number; details: any[] }> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate all users exist and have STUDENT role
            const users = await this.userRepository.find({
                where: { 
                    id: In(batchUnregisterUsersDto.user_ids), 
                    role: UserRole.STUDENT 
                },
            });

            if (users.length !== batchUnregisterUsersDto.user_ids.length) {
                const foundUserIds = users.map(u => u.id);
                const missingUserIds = batchUnregisterUsersDto.user_ids.filter(id => !foundUserIds.includes(id));
                throw new NotFoundException(`Student users with IDs ${missingUserIds.join(', ')} not found`);
            }

            // Validate course registration subject exists
            const courseRegistrationSubject = await this.courseRegistrationSubjectRepository.findOne({
                where: { id: batchUnregisterUsersDto.course_registration_subject_id },
                relations: ['subject', 'courseRegistration'],
            });

            if (!courseRegistrationSubject) {
                throw new NotFoundException(`Course registration subject with ID ${batchUnregisterUsersDto.course_registration_subject_id} not found`);
            }

            // Get existing registrations for these users in this subject
            const existingRegistrations = await this.studentCourseRegistrationRepository.find({
                where: {
                    user_id: In(batchUnregisterUsersDto.user_ids),
                    course_registration_subject_id: batchUnregisterUsersDto.course_registration_subject_id,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
                relations: ['user'],
            });

            if (existingRegistrations.length === 0) {
                return {
                    message: 'No active registrations found for the specified users in this subject',
                    unregistered_count: 0,
                    details: []
                };
            }

            // Update registrations to CANCELLED status
            const unregistrationDetails = [];
            for (const registration of existingRegistrations) {
                registration.status = StudentRegistrationStatus.CANCELLED;
                registration.rejection_reason = batchUnregisterUsersDto.reason || 'Batch unregistration by admin';
                registration.updated_at = new Date();
                
                await queryRunner.manager.save(StudentCourseRegistration, registration);
                
                unregistrationDetails.push({
                    user_id: registration.user_id,
                    user_name: registration.user?.full_name || 'Unknown',
                    registration_id: registration.id,
                    previous_status: StudentRegistrationStatus.APPROVED,
                    new_status: StudentRegistrationStatus.CANCELLED,
                    reason: registration.rejection_reason
                });
            }

            await queryRunner.commitTransaction();

            return {
                message: `Successfully unregistered ${existingRegistrations.length} users from subject "${courseRegistrationSubject.subject.name}"`,
                unregistered_count: existingRegistrations.length,
                details: unregistrationDetails
            };

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async registerForSubject(userId: number, registerDto: RegisterForSubjectDto): Promise<StudentCourseRegistration> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate user exists and has STUDENT role
            const user = await this.userRepository.findOne({
                where: { id: userId, role: UserRole.STUDENT },
            });
            if (!user) {
                throw new NotFoundException(`Student user with ID ${userId} not found`);
            }

            // Validate course registration subject exists
            const courseRegistrationSubject = await this.courseRegistrationSubjectRepository.findOne({
                where: { id: registerDto.course_registration_subject_id },
                relations: ['courseRegistration', 'courseRegistration.semester', 'subject'],
            });
            if (!courseRegistrationSubject) {
                throw new NotFoundException(`Course registration subject with ID ${registerDto.course_registration_subject_id} not found`);
            }

            // Check if course registration is still open
            if (courseRegistrationSubject.courseRegistration.status !== CourseRegistrationStatus.OPEN) {
                throw new BadRequestException('Course registration is closed');
            }

            // Check registration period
            const now = new Date();
            if (now < courseRegistrationSubject.courseRegistration.start_date) {
                throw new BadRequestException('Registration has not started yet');
            }
            if (now > courseRegistrationSubject.courseRegistration.end_date) {
                throw new BadRequestException('Registration deadline has passed');
            }

            // Check if user already registered for this subject
            const existingRegistration = await this.studentCourseRegistrationRepository.findOne({
                where: {
                    user_id: userId,
                    course_registration_subject_id: registerDto.course_registration_subject_id,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
            });
            if (existingRegistration) {
                throw new ConflictException('User is already registered for this subject');
            }

            // Check if subject is full
            const currentRegistrations = await this.studentCourseRegistrationRepository.count({
                where: {
                    course_registration_subject_id: registerDto.course_registration_subject_id,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
            });
            if (currentRegistrations >= courseRegistrationSubject.max_student) {
                throw new ConflictException('Subject is full. No available slots');
            }

            // Create registration
            const registration = queryRunner.manager.create(StudentCourseRegistration, {
                user_id: userId,
                course_registration_subject_id: registerDto.course_registration_subject_id,
                status: StudentRegistrationStatus.PENDING,
                registered_at: new Date(),
                notes: registerDto.notes,
            });

            const savedRegistration = await queryRunner.manager.save(StudentCourseRegistration, registration);
            await queryRunner.commitTransaction();

            // Return with relations
            return await this.findRegistrationWithDetails(savedRegistration.id);

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // =============== Get Available Subjects ===============

    async getAvailableSubjects(userId: number): Promise<AvailableSubjectResponseDto[]> {
        // Validate user exists and has STUDENT role
        const user = await this.userRepository.findOne({
            where: { id: userId, role: UserRole.STUDENT },
            relations: ['student', 'student.classes'],
        });
        if (!user) {
            throw new NotFoundException(`Student user with ID ${userId} not found`);
        }

        // Get student information
        const student = await this.studentRepository.findOne({
            where: { student_code: user.username },
            relations: ['classes'],
        });
        if (!student) {
            throw new NotFoundException(`Student profile not found for user ID ${userId}`);
        }

        // Get student's class
        const studentClass = student.classes;
        if (!studentClass) {
            throw new NotFoundException(`Student class not found for user ID ${userId}`);
        }

        // Find course registrations for this class
        const courseRegistrationClasses = await this.courseRegistrationClassesRepository.find({
            where: { class_id: studentClass.id },
            relations: ['courseRegistration'],
        });

        if (courseRegistrationClasses.length === 0) {
            return []; // No course registrations available for this class
        }

        // Get all course registration IDs for this class
        const courseRegistrationIds = courseRegistrationClasses.map(crc => crc.course_registration_id);

        // Get course registration subjects for these course registrations
        const subjects = await this.courseRegistrationSubjectRepository.find({
            where: { course_registration_id: In(courseRegistrationIds) },
            relations: [
                'subject',
                'courseRegistration',
                'courseRegistration.semester',
                'courseRegistrationSchedules',
            ],
        });

        // Get user's existing registrations
        const userRegistrations = await this.studentCourseRegistrationRepository.find({
            where: { user_id: userId },
        });
        const registrationMap = new Map(
            userRegistrations.map(reg => [reg.course_registration_subject_id, reg])
        );

        // Build response with availability info
        const result: AvailableSubjectResponseDto[] = [];
        
        for (const subject of subjects) {
            // Count current registrations
            const currentRegistrations = await this.studentCourseRegistrationRepository.count({
                where: {
                    course_registration_subject_id: subject.id,
                    status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
                },
            });

            const userRegistration = registrationMap.get(subject.id);
            
            result.push({
                id: subject.id,
                subject_id: subject.subject_id,
                start_date: subject.start_date,
                end_date: subject.end_date,
                max_student: subject.max_student,
                current_registrations: currentRegistrations,
                available_slots: subject.max_student - currentRegistrations,
                description: subject.description,
                location: subject.location,
                subject: {
                    id: subject.subject.id,
                    name: subject.subject.name,
                    credits: subject.subject.credits,
                    description: subject.subject.description,
                },
                courseRegistration: {
                    id: subject.courseRegistration.id,
                    semester_id: subject.courseRegistration.semester_id,
                    start_date: subject.courseRegistration.start_date,
                    end_date: subject.courseRegistration.end_date,
                    status: subject.courseRegistration.status,
                    semester: {
                        id: subject.courseRegistration.semester.id,
                        name: subject.courseRegistration.semester.name,
                    },
                },
                courseRegistrationSchedules: subject.courseRegistrationSchedules.map(schedule => ({
                    id: schedule.id,
                    sections: schedule.sections,
                    schedule: schedule.schedule,
                })),
                isRegistered: !!userRegistration,
                registrationStatus: userRegistration?.status,
            });
        }

        return result;
    }

    // =============== Registration History ===============

    async getRegistrationHistory(userId: number, filters?: GetRegistrationHistoryDto): Promise<StudentCourseRegistration[]> {
        const whereConditions: any = { user_id: userId };

        if (filters?.status) {
            whereConditions.status = filters.status;
        }

        // If course_registration_id is provided, join and filter
        const queryBuilder = this.studentCourseRegistrationRepository
            .createQueryBuilder('registration')
            .leftJoinAndSelect('registration.user', 'user')
            .leftJoinAndSelect('registration.courseRegistrationSubject', 'courseRegistrationSubject')
            .leftJoinAndSelect('courseRegistrationSubject.subject', 'subject')
            .leftJoinAndSelect('courseRegistrationSubject.courseRegistration', 'courseRegistration')
            .leftJoinAndSelect('courseRegistration.semester', 'semester')
            .leftJoinAndSelect('courseRegistrationSubject.courseRegistrationSchedules', 'schedules')
            .where('registration.user_id = :userId', { userId });

        if (filters?.status) {
            queryBuilder.andWhere('registration.status = :status', { status: filters.status });
        }

        if (filters?.course_registration_id) {
            queryBuilder.andWhere('courseRegistration.id = :courseRegistrationId', { 
                courseRegistrationId: filters.course_registration_id 
            });
        }

        if (filters?.semester_id) {
            queryBuilder.andWhere('semester.id = :semesterId', { semesterId: filters.semester_id });
        }

        return await queryBuilder
            .orderBy('registration.registered_at', 'DESC')
            .getMany();
    }

    // =============== Admin Functions ===============

    async updateRegistrationStatus(registrationId: number, updateDto: UpdateRegistrationStatusDto): Promise<StudentCourseRegistration> {
        const registration = await this.studentCourseRegistrationRepository.findOne({
            where: { id: registrationId },
            relations: ['student', 'courseRegistrationSubject'],
        });

        if (!registration) {
            throw new NotFoundException(`Registration with ID ${registrationId} not found`);
        }

        // Update status
        registration.status = updateDto.status;
        if (updateDto.rejection_reason) {
            registration.rejection_reason = updateDto.rejection_reason;
        }

        const updatedRegistration = await this.studentCourseRegistrationRepository.save(registration);
        return await this.findRegistrationWithDetails(updatedRegistration.id);
    }

    async cancelRegistration(userId: number, registrationId: number): Promise<StudentCourseRegistration> {
        const registration = await this.studentCourseRegistrationRepository.findOne({
            where: { 
                id: registrationId,
                user_id: userId,
                status: In([StudentRegistrationStatus.PENDING, StudentRegistrationStatus.APPROVED]),
            },
        });

        if (!registration) {
            throw new NotFoundException('Registration not found or cannot be cancelled');
        }

        registration.status = StudentRegistrationStatus.CANCELLED;
        const updatedRegistration = await this.studentCourseRegistrationRepository.save(registration);
        return await this.findRegistrationWithDetails(updatedRegistration.id);
    }

    // =============== New APIs ===============

    async getStudentSubjectsBySemester(userId: number, filters: GetStudentSubjectsBySemesterDto): Promise<CourseRegistrationSubject[]> {
        // Validate user exists and has STUDENT role
        const user = await this.userRepository.findOne({
            where: { id: userId, role: UserRole.STUDENT },
        });
        if (!user) {
            throw new NotFoundException(`Student user with ID ${userId} not found`);
        }

        const queryBuilder = this.studentCourseRegistrationRepository
            .createQueryBuilder('registration')
            .leftJoinAndSelect('registration.courseRegistrationSubject', 'courseRegistrationSubject')
            .leftJoinAndSelect('courseRegistrationSubject.subject', 'subject')
            .leftJoinAndSelect('courseRegistrationSubject.courseRegistration', 'courseRegistration')
            .leftJoinAndSelect('courseRegistration.semester', 'semester')
            .leftJoinAndSelect('courseRegistrationSubject.courseRegistrationSchedules', 'schedules')
            .where('registration.user_id = :userId', { userId })
            .andWhere('semester.id = :semesterId', { semesterId: filters.semester_id });

        if (filters.status) {
            queryBuilder.andWhere('registration.status = :status', { status: filters.status });
        }

        const registrations = await queryBuilder
            .orderBy('registration.registered_at', 'ASC')
            .getMany();

        return registrations.map(registration => registration.courseRegistrationSubject);
    }

    async getStudentsInSubject(filters: GetStudentsInSubjectDto): Promise<StudentCourseRegistration[]> {
        const queryBuilder = this.studentCourseRegistrationRepository
            .createQueryBuilder('registration')
            .leftJoinAndSelect('registration.user', 'user')
            .leftJoinAndSelect('registration.courseRegistrationSubject', 'courseRegistrationSubject')
            .leftJoinAndSelect('courseRegistrationSubject.subject', 'subject')
            .where('registration.course_registration_subject_id = :courseRegistrationSubjectId', { 
                courseRegistrationSubjectId: filters.course_registration_subject_id 
            });

        if (filters.status) {
            queryBuilder.andWhere('registration.status = :status', { status: filters.status });
        }

        return await queryBuilder
            .orderBy('registration.registered_at', 'ASC')
            .getMany();
    }

    // =============== Utility Methods ===============

    async findRegistrationWithDetails(registrationId: number): Promise<StudentCourseRegistration> {
        return await this.studentCourseRegistrationRepository.findOne({
            where: { id: registrationId },
            relations: [
                'user',
                'courseRegistrationSubject',
                'courseRegistrationSubject.subject',
                'courseRegistrationSubject.courseRegistration',
                'courseRegistrationSubject.courseRegistration.semester',
                'courseRegistrationSubject.courseRegistrationSchedules',
            ],
        });
    }

    async getAllRegistrations(courseRegistrationId?: number) {
        const registrations = await this.studentCourseRegistrationRepository.find({
            where: {
                course_registration_subject_id: courseRegistrationId,
                status: In([StudentRegistrationStatus.APPROVED])
            },
            order: { created_at: 'DESC' },
            relations: [
                'user',
            ],
            select: ['user']
        });
        return registrations.map(registration => registration.user);
    }

    async getAllUnregistrations(courseRegistrationId?: number) {
        const registrations = await this.studentCourseRegistrationRepository.find({
            where: {
                course_registration_subject_id: courseRegistrationId,
                status: In([StudentRegistrationStatus.CANCELLED])
            },
            order: { created_at: 'DESC' },
            relations: [
                'user',
            ],
        });

        return registrations.map(registration => {
            return {
                user: registration.user,
                rejection_reason: registration.rejection_reason,
            };
        });
    }
}
