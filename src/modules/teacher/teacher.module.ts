import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Teacher } from '../../entities/teacher.entity';
import { Faculty } from '../../entities/faculty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, Faculty])],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
