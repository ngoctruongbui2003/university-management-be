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
import { CurriculumSessionsController } from './curriculum-sessions.controller';
import { SubjectPrerequisite } from 'src/entities/subject_prerequisite.entity';
import { Subject } from 'src/entities/subject.entity';
import { Major } from 'src/entities/major.entity';
import { CurriculumConnect } from 'src/entities/curriculum-connect.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Curriculum,
      CurriculumSession,
      CurriculumItem,
      SubjectCurriculumItem,
      SubjectPrerequisite,
      Subject,
      Major,
      CurriculumConnect,
    ]),
  ],
  controllers: [
    CurriculumSessionsController
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