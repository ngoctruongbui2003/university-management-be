import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectCurriculumItem } from '../../entities/subject-curriculum-item.entity';
import { CreateSubjectCurriculumItemDto } from './dto/create-subject-curriculum-item.dto';
import { SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES } from './constants/error-messages';
import { CurriculumItemsService } from './curriculum-items.service';

@Injectable()
export class SubjectCurriculumItemsService {
  constructor(
    @InjectRepository(SubjectCurriculumItem)
    private subjectItemRepository: Repository<SubjectCurriculumItem>,
    private curriculumItemsService: CurriculumItemsService,
  ) {}

  async create(createSubjectItemDto: CreateSubjectCurriculumItemDto): Promise<SubjectCurriculumItem> {
    try {
      // Verify curriculum item exists
      await this.curriculumItemsService.findOne(createSubjectItemDto.curriculumItemId);

      // Check if subject already exists in this curriculum item
      const existingSubjectItem = await this.subjectItemRepository.findOne({
        where: {
          curriculumItemId: createSubjectItemDto.curriculumItemId,
          subjectId: createSubjectItemDto.subjectId,
        },
      });

      if (existingSubjectItem) {
        throw new ConflictException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.ALREADY_EXISTS);
      }

      // Validate credits
      if (createSubjectItemDto.credits < 1) {
        throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.INVALID_CREDITS);
      }

      // If prerequisite is specified, verify it exists
      if (createSubjectItemDto.prerequisiteId) {
        const prerequisiteExists = await this.subjectItemRepository.findOne({
          where: { subjectId: createSubjectItemDto.prerequisiteId },
        });

        if (!prerequisiteExists) {
          throw new NotFoundException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.PREREQUISITE_NOT_FOUND);
        }
      }

      const subjectItem = this.subjectItemRepository.create(createSubjectItemDto);
      return await this.subjectItemRepository.save(subjectItem);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  async findAll(): Promise<SubjectCurriculumItem[]> {
    try {
      return await this.subjectItemRepository.find({
        relations: ['curriculumItem', 'subject', 'prerequisite'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async findOne(id: number): Promise<SubjectCurriculumItem> {
    try {
      const subjectItem = await this.subjectItemRepository.findOne({
        where: { id },
        relations: ['curriculumItem', 'subject', 'prerequisite'],
      });

      if (!subjectItem) {
        throw new NotFoundException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
      }

      return subjectItem;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.INVALID_ID);
    }
  }

  async findByCurriculumItem(curriculumItemId: number): Promise<SubjectCurriculumItem[]> {
    try {
      // Verify curriculum item exists
      await this.curriculumItemsService.findOne(curriculumItemId);

      return await this.subjectItemRepository.find({
        where: { curriculumItemId },
        relations: ['curriculumItem', 'subject', 'prerequisite'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.ITEM_NOT_FOUND);
      }
      throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async update(id: number, updateSubjectItemDto: CreateSubjectCurriculumItemDto): Promise<SubjectCurriculumItem> {
    try {
      const subjectItem = await this.findOne(id);

      // Verify curriculum item exists
      await this.curriculumItemsService.findOne(updateSubjectItemDto.curriculumItemId);

      // Check if new subject conflicts with existing subject in the curriculum item
      if (updateSubjectItemDto.subjectId !== subjectItem.subjectId) {
        const existingSubjectItem = await this.subjectItemRepository.findOne({
          where: {
            curriculumItemId: updateSubjectItemDto.curriculumItemId,
            subjectId: updateSubjectItemDto.subjectId,
          },
        });

        if (existingSubjectItem) {
          throw new ConflictException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.ALREADY_EXISTS);
        }
      }

      // Validate credits
      if (updateSubjectItemDto.credits < 1) {
        throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.INVALID_CREDITS);
      }

      // If prerequisite is specified, verify it exists
      if (updateSubjectItemDto.prerequisiteId) {
        const prerequisiteExists = await this.subjectItemRepository.findOne({
          where: { subjectId: updateSubjectItemDto.prerequisiteId },
        });

        if (!prerequisiteExists) {
          throw new NotFoundException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.PREREQUISITE_NOT_FOUND);
        }
      }

      Object.assign(subjectItem, updateSubjectItemDto);
      return await this.subjectItemRepository.save(subjectItem);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.subjectItemRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_CURRICULUM_ITEM_ERROR_MESSAGES.DELETE_FAILED);
    }
  }
} 