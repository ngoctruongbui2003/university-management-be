import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { Classroom } from '../../entities/classroom.entity';
import { ClassroomSchedule } from '../../entities/classroom-schedule.entity';
import { ClassroomPost } from '../../entities/classroom-post.entity';
import { ClassroomMember } from '../../entities/classroom-member.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';
import { Subject } from 'src/entities/subject.entity';
import { ClassroomSection } from 'src/entities/classsroom-section.entity';
import { ClassroomSectionStudent } from 'src/entities/classroom-section-student.entity';
import { ClassroomStudentGrade } from 'src/entities/classroom-student-grade.entity';
import { Student } from 'src/entities/student.entity';
import { Faculty } from 'src/entities/faculty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Classroom,
      ClassroomSchedule,
      ClassroomPost,
      ClassroomMember,
      Course,
      User,
      Subject,
      ClassroomSection,
      ClassroomSectionStudent,
      ClassroomStudentGrade,
      Student,
      Faculty
    ]),
    FileUploadModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5, // Max 5 files per request
      },
    }),
  ],
  controllers: [ClassroomController],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}