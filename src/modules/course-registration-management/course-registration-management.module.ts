import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseRegistrationManagementController } from './course-registration-management.controller';
import { CourseRegistrationManagementService } from './course-registration-management.service';
import { CourseRegistration } from '../../entities/course-registration.entity';
import { CourseRegistrationClasses } from '../../entities/course-registration-classes.entity';
import { CourseRegistrationSubject } from '../../entities/course-registration-subject.entity';
import { CourseRegistrationSchedule } from '../../entities/course-registration-schedule.entity';
import { Semester } from '../../entities/semester.entity';
import { Classes } from '../../entities/classes.entity';
import { Subject } from '../../entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseRegistration,
      CourseRegistrationClasses,
      CourseRegistrationSubject,
      CourseRegistrationSchedule,
      Semester,
      Classes,
      Subject,
    ]),
  ],
  controllers: [CourseRegistrationManagementController],
  providers: [CourseRegistrationManagementService],
  exports: [CourseRegistrationManagementService],
})
export class CourseRegistrationManagementModule {}