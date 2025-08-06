import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseRegistrationController } from './course-registration.controller';
import { CourseRegistrationService } from './course-registration.service';
import { Registration } from '../../entities/registration.entity';
import { Course } from '../../entities/course.entity';
import { Student } from '../../entities/student.entity';
import { RegistrationSession } from '../../entities/registration-session.entity';
import { SessionCourse } from '../../entities/session-course.entity';
import { SessionCourseDepartment } from '../../entities/session-course-department.entity';
import { CourseSchedule } from '../../entities/course-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Registration,
      Course,
      Student,
      RegistrationSession,
      SessionCourse,
      SessionCourseDepartment,
      CourseSchedule,
    ]),
  ],
  controllers: [CourseRegistrationController],
  providers: [CourseRegistrationService],
  exports: [CourseRegistrationService],
})
export class CourseRegistrationModule {}