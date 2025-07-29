import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumItem } from '../../entities/curriculum-item.entity';
import { CreateCurriculumItemDto } from './dto/create-curriculum-item.dto';
import { CURRICULUM_ITEM_ERROR_MESSAGES } from './constants/error-messages';
import { CurriculumSessionsService } from './curriculum-sessions.service';

@Injectable()
export class CurriculumItemsService {
  constructor(
    @InjectRepository(CurriculumItem)
    private itemRepository: Repository<CurriculumItem>,
    private sessionsService: CurriculumSessionsService,
  ) {}

  async create(createItemDto: CreateCurriculumItemDto): Promise<CurriculumItem> {
    try {
      // Verify session exists
      const session = await this.sessionsService.findOne(createItemDto.curriculumTypeId);

      // Check if item number already exists in this session
      const existingItem = await this.itemRepository.findOne({
        where: {
          curriculumTypeId: createItemDto.curriculumTypeId,
          itemNumber: createItemDto.itemNumber,
        },
      });

      if (existingItem) {
        throw new ConflictException(CURRICULUM_ITEM_ERROR_MESSAGES.ALREADY_EXISTS);
      }

      // Validate item number against session's total items
      if (createItemDto.itemNumber > session.totalItems) {
        throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.INVALID_ITEM_NUMBER);
      }

      const item = this.itemRepository.create(createItemDto);
      return await this.itemRepository.save(item);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(CURRICULUM_ITEM_ERROR_MESSAGES.SESSION_NOT_FOUND);
      }
      throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  async findAll(): Promise<CurriculumItem[]> {
    try {
      return await this.itemRepository.find({
        relations: ['session', 'subjectItems'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async findOne(id: number): Promise<CurriculumItem> {
    try {
      const item = await this.itemRepository.findOne({
        where: { id },
        relations: ['session', 'subjectItems'],
      });

      if (!item) {
        throw new NotFoundException(CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
      }

      return item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.INVALID_ID);
    }
  }

  async findBySession(sessionId: number): Promise<CurriculumItem[]> {
    try {
      // Verify session exists
      await this.sessionsService.findOne(sessionId);

      return await this.itemRepository.find({
        where: { curriculumTypeId: sessionId },
        relations: ['session', 'subjectItems'],
        order: {
          itemNumber: 'ASC',
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(CURRICULUM_ITEM_ERROR_MESSAGES.SESSION_NOT_FOUND);
      }
      throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async update(id: number, updateItemDto: CreateCurriculumItemDto): Promise<CurriculumItem> {
    try {
      const item = await this.findOne(id);

      // Verify session exists
      const session = await this.sessionsService.findOne(updateItemDto.curriculumTypeId);

      // Check if new item number conflicts with existing item in the session
      if (updateItemDto.itemNumber !== item.itemNumber) {
        const existingItem = await this.itemRepository.findOne({
          where: {
            curriculumTypeId: updateItemDto.curriculumTypeId,
            itemNumber: updateItemDto.itemNumber,
          },
        });

        if (existingItem) {
          throw new ConflictException(CURRICULUM_ITEM_ERROR_MESSAGES.ALREADY_EXISTS);
        }

        // Validate new item number against session's total items
        if (updateItemDto.itemNumber > session.totalItems) {
          throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.INVALID_ITEM_NUMBER);
        }
      }

      Object.assign(item, updateItemDto);
      return await this.itemRepository.save(item);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.itemRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(CURRICULUM_ITEM_ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(CURRICULUM_ITEM_ERROR_MESSAGES.DELETE_FAILED);
    }
  }
} 