import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../../entities/subject.entity';
import { Faculty } from '../../entities/faculty.entity';
import { GradingFormula } from '../../entities/grading-formula.entity';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { GradingFormulasModule } from '../grading-formulas/grading-formulas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, Faculty, GradingFormula]),
    GradingFormulasModule,
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}