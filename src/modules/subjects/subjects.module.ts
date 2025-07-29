import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../../entities/subject.entity';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { GradingFormulasModule } from '../grading-formulas/grading-formulas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject]),
    GradingFormulasModule,
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}