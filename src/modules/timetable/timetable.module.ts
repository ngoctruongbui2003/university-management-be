import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { Registration } from '../../entities/registration.entity';
import { Student } from '../../entities/student.entity';
import { CourseSchedule } from '../../entities/course-schedule.entity';
import { Semester } from '../../entities/semester.entity';
import { Course } from '../../entities/course.entity';
import { Subject } from '../../entities/subject.entity';
import { Teacher } from '../../entities/teacher.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Registration,
      Student,
      CourseSchedule,
      Semester,
      Course,
      Subject,
      Teacher,
    ]),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}