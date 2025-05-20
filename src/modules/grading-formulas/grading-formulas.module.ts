import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradingFormula } from '../../entities/grading-formula.entity';
import { GradeType } from '../../entities/grade-type.entity';
import { GradingFormulasService } from './grading-formulas.service';
import { GradingFormulasController } from './grading-formulas.controller';
import { GradeTypesService } from './grade-types.service';
import { GradeTypesController } from './grade-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GradingFormula, GradeType])],
  controllers: [GradingFormulasController, GradeTypesController],
  providers: [GradingFormulasService, GradeTypesService],
  exports: [GradingFormulasService, GradeTypesService],
})
export class GradingFormulasModule {} 