import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from '../../entities/curriculum.entity';
import { CurriculumSession } from '../../entities/curriculum-session.entity';
import { CurriculumItem } from '../../entities/curriculum-item.entity';
import { SubjectCurriculumItem } from '../../entities/subject-curriculum-item.entity';
import { CurriculumsService } from './curriculums.service';
import { CurriculumSessionsService } from './curriculum-sessions.service';
import { CurriculumItemsService } from './curriculum-items.service';
import { SubjectCurriculumItemsService } from './subject-curriculum-items.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curriculum,
      CurriculumSession,
      CurriculumItem,
      SubjectCurriculumItem,
    ]),
  ],
  providers: [
    CurriculumsService,
    CurriculumSessionsService,
    CurriculumItemsService,
    SubjectCurriculumItemsService,
  ],
  exports: [
    CurriculumsService,
    CurriculumSessionsService,
    CurriculumItemsService,
    SubjectCurriculumItemsService,
  ],
})
export class CurriculumsModule {} 