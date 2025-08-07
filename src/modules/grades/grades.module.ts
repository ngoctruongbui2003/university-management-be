import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { StudentGrade } from '../../entities/student-grade.entity';
import { GradeBookEntry } from '../../entities/grade-book-entry.entity';
import { Classroom } from '../../entities/classroom.entity';
import { ClassroomMember } from '../../entities/classroom-member.entity';
import { GradeType } from '../../entities/grade-type.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentGrade,
      GradeBookEntry,
      Classroom,
      ClassroomMember,
      GradeType,
      User,
    ]),
  ],
  controllers: [GradesController],
  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}