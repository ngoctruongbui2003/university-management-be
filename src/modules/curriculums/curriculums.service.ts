import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Curriculum, CurriculumStatus } from '../../entities/curriculum.entity';
import { CreateCurriculumDto, SemesterColumnDto, SubjectDto } from './dto/create-curriculum.dto';
import { CURRICULUM_ERROR_MESSAGES } from './constants/error-messages';
import { CurriculumConnect } from 'src/entities/curriculum-connect.entity';
import { CurriculumSession } from 'src/entities/curriculum-session.entity';
import { CurriculumItem } from 'src/entities/curriculum-item.entity';
import { SubjectCurriculumItem } from 'src/entities/subject-curriculum-item.entity';
import { Subject } from 'src/entities/subject.entity';
import { Major } from 'src/entities/major.entity';
import { SubjectPrerequisite } from 'src/entities/subject_prerequisite.entity';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Major)
    private majorRepository: Repository<Major>,
    @InjectRepository(Curriculum)
    private curriculumRepository: Repository<Curriculum>,
    @InjectRepository(CurriculumConnect)
    private curriculumConnectRepository: Repository<CurriculumConnect>,
    @InjectRepository(CurriculumSession)
    private curriculumSessionRepository: Repository<CurriculumSession>,
    @InjectRepository(CurriculumItem)
    private curriculumItemRepository: Repository<CurriculumItem>,
    @InjectRepository(SubjectCurriculumItem)
    private subjectCurriculumItemRepository: Repository<SubjectCurriculumItem>,
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(SubjectPrerequisite)
    private subjectPrerequisiteRepository: Repository<SubjectPrerequisite>,
  ) {}
  
  async add(createCurriculumDto: CreateCurriculumDto) {
    // ---------------Start Transaction---------------
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        curriculumInfo,
        boards,
        subjects,
      } = createCurriculumDto;

      // ---------------Create Curriculum---------------
      // check majorId is exist
      const major = await this.majorRepository.findOne({
        where: {
          id: Number(curriculumInfo.majorId),
        },
      });
      if (!major) {
        throw new NotFoundException(CURRICULUM_ERROR_MESSAGES.NOT_FOUND);
      }

      // create curriculum
      const curriculum = this.curriculumRepository.create({
        name: curriculumInfo.name,
        description: curriculumInfo.description,
        academicYear: Number(curriculumInfo.academicYear),
        majorId: major.id,
        totalCredits: curriculumInfo.totalCredits,
      });

      await queryRunner.manager.save(Curriculum, curriculum);

      // Map to store subjectCurriculumItemId by subjectKey for prerequisite lookup
      const subjectCurriculumItemMap = new Map<string, number>();

      // ---------------Create Curriculum Connect---------------
      for (const board of boards) {
        const curriculumConnect = this.curriculumConnectRepository.create({
          curriculumId: curriculum.id,
          curriculumSessionId: Number(board.id),
        });

        await queryRunner.manager.save(CurriculumConnect, curriculumConnect);

        const semesterColumns = board.semesterColumn;
      
        // ---------------Create Curriculum Item---------------
        let itemSequenceIndex = 0;
        for (const semesterKey of Object.keys(semesterColumns)) {
          const semester: SemesterColumnDto = semesterColumns[semesterKey];
          const curriculumItem = this.curriculumItemRepository.create({
            curriculumConnectId: curriculumConnect.id,
            name: semester.title,
            itemSequence: itemSequenceIndex++,
          });

          await queryRunner.manager.save(CurriculumItem, curriculumItem);

          let subjectSequenceIndex = 0;
          for (const subjectId of semester.subjectIds) {
            const subject: SubjectDto = subjects[subjectId];
            const subjectCurriculumItem = this.subjectCurriculumItemRepository.create({
              curriculumItemId: curriculumItem.id,
              subjectId: Number(subject.SubjectID),
              isRequired: subject.IsRequired,
              min_credits: subject.MinCredit,
              itemSequence: subjectSequenceIndex++,
            });

            const savedSubjectCurriculumItem = await queryRunner.manager.save(SubjectCurriculumItem, subjectCurriculumItem);
            
            // Store subjectCurriculumItemId for this subjectKey
            subjectCurriculumItemMap.set(subjectId.toString(), savedSubjectCurriculumItem.id);

            // ---------------Create Subject Prerequisites---------------
            if (subject.HasPrerequisite && subject.PrerequisiteSubjects.length > 0) {
              for (const prereqSubjectId of subject.PrerequisiteSubjects) {
                const prereqSubject: SubjectDto = subjects[prereqSubjectId.id];
                if (!prereqSubject) {
                  throw new NotFoundException(`Prerequisite subject ${prereqSubjectId} not found`);
                }

                // We'll create the prerequisite relationship after all subjects are saved
                // to ensure we have all subjectCurriculumItemIds
              }
            }
          }
        }
      }

      // ---------------Create Subject Prerequisite Relationships---------------
      for (const subjectId of Object.keys(subjects)) {
        const subject: SubjectDto = subjects[subjectId];
        if (subject.HasPrerequisite && subject.PrerequisiteSubjects.length > 0) {
          const subjectCurriculumItemId = subjectCurriculumItemMap.get(subjectId);
          
          for (const prereqSubjectId of subject.PrerequisiteSubjects) {
            const prereqSubjectCurriculumItemId = subjectCurriculumItemMap.get(prereqSubjectId.id);
            
            if (!prereqSubjectCurriculumItemId) {
              throw new NotFoundException(`Prerequisite subject ${prereqSubjectId} not found in curriculum items`);
            }

            const subjectPrerequisite = this.subjectPrerequisiteRepository.create({
              subjectCurriculumItemId: subjectCurriculumItemId,
              prerequisiteSubjectCurriculumItemId: prereqSubjectCurriculumItemId,
            });

            await queryRunner.manager.save(SubjectPrerequisite, subjectPrerequisite);
          }
        }
      }

      await queryRunner.commitTransaction();
      return curriculum;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 