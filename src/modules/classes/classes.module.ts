import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Classes } from '../../entities/classes.entity';
import { Major } from '../../entities/major.entity';
import { Student } from '../../entities/student.entity';
import { AcademicYear } from '../../entities/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Classes, Major, Student, AcademicYear])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
