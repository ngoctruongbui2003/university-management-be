import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
    CreateCourseRegistrationDto,
    UpdateCourseRegistrationDto,
    AddClassesToCourseRegistrationDto,
    RemoveClassesFromCourseRegistrationDto,
    CreateCourseRegistrationSubjectDto,
    UpdateCourseRegistrationSubjectDto,
} from './dto/course-registration-management.dto';
import { CourseRegistration } from '../../entities/course-registration.entity';
import { CourseRegistrationClasses } from '../../entities/course-registration-classes.entity';
import { CourseRegistrationSubject } from '../../entities/course-registration-subject.entity';
import { CourseRegistrationSchedule } from '../../entities/course-registration-schedule.entity';
import { Semester } from '../../entities/semester.entity';
import { Classes } from '../../entities/classes.entity';
import { Subject } from '../../entities/subject.entity';

@Injectable()
export class CourseRegistrationManagementService {
    constructor(
        @InjectRepository(CourseRegistration)
        private courseRegistrationRepository: Repository<CourseRegistration>,
        @InjectRepository(CourseRegistrationClasses)
        private courseRegistrationClassesRepository: Repository<CourseRegistrationClasses>,
        @InjectRepository(CourseRegistrationSubject)
        private courseRegistrationSubjectRepository: Repository<CourseRegistrationSubject>,
        @InjectRepository(CourseRegistrationSchedule)
        private courseRegistrationScheduleRepository: Repository<CourseRegistrationSchedule>,
        @InjectRepository(Semester)
        private semesterRepository: Repository<Semester>,
        @InjectRepository(Classes)
        private classesRepository: Repository<Classes>,
        @InjectRepository(Subject)
        private subjectRepository: Repository<Subject>,
        private dataSource: DataSource,
    ) {}

    // =============== Course Registration CRUD ===============

    async createCourseRegistration(createDto: CreateCourseRegistrationDto): Promise<CourseRegistration> {
        // Validate semester exists
        const semester = await this.semesterRepository.findOne({
            where: { id: createDto.semester_id },
        });
        if (!semester) {
            throw new NotFoundException(`Semester with ID ${createDto.semester_id} not found`);
        }

        // Validate date range
        const startDate = new Date(createDto.start_date);
        const endDate = new Date(createDto.end_date);
        if (startDate >= endDate) {
            throw new BadRequestException('Start date must be before end date');
        }

        const courseRegistration = this.courseRegistrationRepository.create(createDto);
        return await this.courseRegistrationRepository.save(courseRegistration);
    }

    async findAllCourseRegistrations(): Promise<CourseRegistration[]> {
        return await this.courseRegistrationRepository.find({
            relations: ['semester', 'courseRegistrationClasses'],
            order: { created_at: 'DESC' },
        });
    }

    async findCourseRegistrationById(id: number): Promise<CourseRegistration> {
        const courseRegistration = await this.courseRegistrationRepository.findOne({
            where: { id },
            relations: [
                'semester',
                'courseRegistrationClasses',
                'courseRegistrationClasses.class',
                'courseRegistrationClasses.class.major',
                'courseRegistrationSubjects',
                'courseRegistrationSubjects.subject',
                'courseRegistrationSubjects.courseRegistrationSchedules',
                'courseRegistrationSubjects.studentCourseRegistrations',
            ],
        });

        if (!courseRegistration) {
            throw new NotFoundException(`Course registration with ID ${id} not found`);
        }

        return courseRegistration;
    }

    async updateCourseRegistration(id: number, updateDto: UpdateCourseRegistrationDto): Promise<CourseRegistration> {
        const courseRegistration = await this.findCourseRegistrationById(id);

        // Validate semester if provided
        if (updateDto.semester_id) {
            const semester = await this.semesterRepository.findOne({
                where: { id: updateDto.semester_id },
            });
            if (!semester) {
                throw new NotFoundException(`Semester with ID ${updateDto.semester_id} not found`);
            }
        }

        // Validate date range if both dates are provided
        if (updateDto.start_date && updateDto.end_date) {
            const startDate = new Date(updateDto.start_date);
            const endDate = new Date(updateDto.end_date);
            if (startDate >= endDate) {
                throw new BadRequestException('Start date must be before end date');
            }
        }

        Object.assign(courseRegistration, updateDto);
        return await this.courseRegistrationRepository.save(courseRegistration);
    }

    async deleteCourseRegistration(id: number): Promise<void> {
        const courseRegistration = await this.findCourseRegistrationById(id);
        await this.courseRegistrationRepository.remove(courseRegistration);
    }

    // =============== Course Registration Classes Management ===============

    async addClassesToCourseRegistration(courseRegistrationId: number, addClassesDto: AddClassesToCourseRegistrationDto): Promise<CourseRegistrationClasses[]> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate course registration exists
            const courseRegistration = await this.courseRegistrationRepository.findOne({
                where: { id: courseRegistrationId },
            });
            if (!courseRegistration) {
                throw new NotFoundException(`Course registration with ID ${courseRegistrationId} not found`);
            }

            // Validate all classes exist
            const classes = await this.classesRepository.find({
                where: { id: In(addClassesDto.class_ids) },
            });
            if (classes.length !== addClassesDto.class_ids.length) {
                throw new NotFoundException('One or more classes not found');
            }

            // Check for existing relationships
            const existingRelations = await this.courseRegistrationClassesRepository.find({
                where: {
                    course_registration_id: courseRegistrationId,
                    class_id: In(addClassesDto.class_ids),
                },
            });

            if (existingRelations.length > 0) {
                const existingClassIds = existingRelations.map(rel => rel.class_id);
                throw new ConflictException(`Classes with IDs [${existingClassIds.join(', ')}] are already added to this course registration`);
            }

            // Create new relationships
            const newRelations = addClassesDto.class_ids.map(classId => 
                queryRunner.manager.create(CourseRegistrationClasses, {
                    course_registration_id: courseRegistrationId,
                    class_id: classId,
                })
            );

            const savedRelations = await queryRunner.manager.save(CourseRegistrationClasses, newRelations);
            await queryRunner.commitTransaction();

            // Return with relations
            return await this.courseRegistrationClassesRepository.find({
                where: { id: In(savedRelations.map(rel => rel.id)) },
                relations: ['class', 'class.major'],
            });

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async removeClassesFromCourseRegistration(courseRegistrationId: number, removeClassesDto: RemoveClassesFromCourseRegistrationDto): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate course registration exists
            const courseRegistration = await this.courseRegistrationRepository.findOne({
                where: { id: courseRegistrationId },
            });
            if (!courseRegistration) {
                throw new NotFoundException(`Course registration with ID ${courseRegistrationId} not found`);
            }

            // Find existing relationships
            const existingRelations = await this.courseRegistrationClassesRepository.find({
                where: {
                    course_registration_id: courseRegistrationId,
                    class_id: In(removeClassesDto.class_ids),
                },
            });

            if (existingRelations.length === 0) {
                throw new NotFoundException('No matching class relationships found to remove');
            }

            // No need to check for associated subjects since they're now directly under course registration

            // Remove relationships
            await queryRunner.manager.remove(CourseRegistrationClasses, existingRelations);
            await queryRunner.commitTransaction();

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // =============== Course Registration Subject Management ===============

    async createCourseRegistrationSubject(createDto: CreateCourseRegistrationSubjectDto): Promise<CourseRegistrationSubject> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Validate course registration exists
            const courseRegistration = await this.courseRegistrationRepository.findOne({
                where: { id: createDto.course_registration_id },
            });
            if (!courseRegistration) {
                throw new NotFoundException(`Course registration with ID ${createDto.course_registration_id} not found`);
            }

            // Validate subject exists
            const subject = await this.subjectRepository.findOne({
                where: { id: createDto.subject_id },
            });
            if (!subject) {
                throw new NotFoundException(`Subject with ID ${createDto.subject_id} not found`);
            }

            // Validate date range
            const startDate = new Date(createDto.start_date);
            const endDate = new Date(createDto.end_date);
            if (startDate >= endDate) {
                throw new BadRequestException('Start date must be before end date');
            }

            // Check for duplicate subject in the same course registration
            const existingSubject = await this.courseRegistrationSubjectRepository.findOne({
                where: {
                    course_registration_id: createDto.course_registration_id,
                    subject_id: createDto.subject_id,
                },
            });
            if (existingSubject) {
                throw new ConflictException('Subject is already added to this course registration');
            }

            // Create course registration subject
            const courseRegistrationSubject = queryRunner.manager.create(CourseRegistrationSubject, {
                ...createDto,
                semester_id: courseRegistration.semester_id,
            });

            const savedSubject = await queryRunner.manager.save(CourseRegistrationSubject, courseRegistrationSubject);

            // Create schedules if provided
            if (createDto.schedules && createDto.schedules.length > 0) {
                const schedules = createDto.schedules.map(scheduleDto =>
                    queryRunner.manager.create(CourseRegistrationSchedule, {
                        ...scheduleDto,
                        course_registration_subject_id: savedSubject.id,
                    })
                );
                await queryRunner.manager.save(CourseRegistrationSchedule, schedules);
            }

            await queryRunner.commitTransaction();

            // Return with relations
            return await this.courseRegistrationSubjectRepository.findOne({
                where: { id: savedSubject.id },
                relations: ['subject', 'semester', 'courseRegistrationSchedules'],
            });

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateCourseRegistrationSubject(id: number, updateDto: UpdateCourseRegistrationSubjectDto): Promise<CourseRegistrationSubject> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const courseRegistrationSubject = await this.courseRegistrationSubjectRepository.findOne({
                where: { id },
                relations: ['subject', 'semester', 'courseRegistrationSchedules'],
            });

            if (!courseRegistrationSubject) {
                throw new NotFoundException(`Course registration subject with ID ${id} not found`);
            }

            // Validate subject if provided
            if (updateDto.subject_id && updateDto.subject_id !== courseRegistrationSubject.subject_id) {
                const subject = await this.subjectRepository.findOne({
                    where: { id: updateDto.subject_id },
                });
                if (!subject) {
                    throw new NotFoundException(`Subject with ID ${updateDto.subject_id} not found`);
                }
            }

            // Validate date range if both dates are provided
            if (updateDto.start_date && updateDto.end_date) {
                const startDate = new Date(updateDto.start_date);
                const endDate = new Date(updateDto.end_date);
                if (startDate >= endDate) {
                    throw new BadRequestException('Start date must be before end date');
                }
            }

            // Update schedules if provided
            if (updateDto.schedules !== undefined) {
                // Remove existing schedules by deleting them directly
                if (courseRegistrationSubject.courseRegistrationSchedules.length > 0) {
                    await queryRunner.manager.delete(CourseRegistrationSchedule, {
                        course_registration_subject_id: id
                    });
                }

                // Create new schedules
                if (updateDto.schedules.length > 0) {
                    const newSchedules = updateDto.schedules.map(scheduleDto =>
                        queryRunner.manager.create(CourseRegistrationSchedule, {
                            sections: scheduleDto.sections,
                            schedule: scheduleDto.schedule,
                            course_registration_subject_id: id,
                        })
                    );
                    await queryRunner.manager.save(CourseRegistrationSchedule, newSchedules);
                }
            }

            // Update the subject entity (exclude schedules from the update)
            const { schedules, ...updateData } = updateDto;
            Object.assign(courseRegistrationSubject, updateData);
            
            const updatedSubject = await queryRunner.manager.save(CourseRegistrationSubject, courseRegistrationSubject);
            await queryRunner.commitTransaction();

            // Return with fresh relations
            return await this.courseRegistrationSubjectRepository.findOne({
                where: { id },
                relations: ['subject', 'semester', 'courseRegistrationSchedules'],
            });

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteCourseRegistrationSubject(id: number): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const courseRegistrationSubject = await this.courseRegistrationSubjectRepository.findOne({
                where: { id },
            });

            if (!courseRegistrationSubject) {
                throw new NotFoundException(`Course registration subject with ID ${id} not found`);
            }

            // Delete schedules first
            await queryRunner.manager.delete(CourseRegistrationSchedule, {
                course_registration_subject_id: id
            });

            // Then delete the subject
            await queryRunner.manager.delete(CourseRegistrationSubject, {
                id: id
            });
            
            await queryRunner.commitTransaction();

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    // =============== Utility Methods ===============

    async findCourseRegistrationClassesByRegistrationId(courseRegistrationId: number): Promise<CourseRegistrationClasses[]> {
        return await this.courseRegistrationClassesRepository.find({
            where: { course_registration_id: courseRegistrationId },
            relations: ['class', 'class.major'],
        });
    }

    async findCourseRegistrationSubjectsByRegistrationId(courseRegistrationId: number): Promise<CourseRegistrationSubject[]> {
        console.log(courseRegistrationId);
        const courseRegistration = await this.courseRegistrationRepository.findOne({
            where: { id: courseRegistrationId },
            relations: ['courseRegistrationSubjects', 'courseRegistrationSubjects.subject'],
        });
        return courseRegistration.courseRegistrationSubjects;
    }
}
