import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student } from '../../entities/student.entity';
import { Classes } from '../../entities/classes.entity';
import { AcademicYear } from '../../entities/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Classes, AcademicYear])],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
