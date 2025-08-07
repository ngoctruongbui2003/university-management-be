import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { Classroom } from '../../entities/classroom.entity';
import { ClassroomPost } from '../../entities/classroom-post.entity';
import { ClassroomMember } from '../../entities/classroom-member.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { FileUploadModule } from '../file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Classroom,
      ClassroomPost,
      ClassroomMember,
      Course,
      User,
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