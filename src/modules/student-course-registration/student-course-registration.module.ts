import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCourseRegistrationController } from './student-course-registration.controller';
import { StudentCourseRegistrationService } from './student-course-registration.service';
import { StudentCourseRegistration } from '../../entities/student-course-registration.entity';
import { CourseRegistrationSubject } from '../../entities/course-registration-subject.entity';
import { CourseRegistration } from '../../entities/course-registration.entity';
import { User } from '../../entities/user.entity';
import { Subject } from '../../entities/subject.entity';
import { Student } from '../../entities/student.entity';
import { CourseRegistrationClasses } from '../../entities/course-registration-classes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentCourseRegistration,
      CourseRegistrationSubject,
      CourseRegistration,
      User,
      Subject,
      Student,
      CourseRegistrationClasses,
    ]),
  ],
  controllers: [StudentCourseRegistrationController],
  providers: [StudentCourseRegistrationService],
  exports: [StudentCourseRegistrationService],
})
export class StudentCourseRegistrationModule {}
