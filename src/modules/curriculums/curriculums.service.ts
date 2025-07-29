import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curriculum } from '../../entities/curriculum.entity';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { CURRICULUM_ERROR_MESSAGES } from './constants/error-messages';

@Injectable()
export class CurriculumsService {
  constructor(
    @InjectRepository(Curriculum)
    private curriculumRepository: Repository<Curriculum>,
  ) {}

  async create(createCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    try {
      // Check if curriculum with same name exists
      const existingCurriculum = await this.curriculumRepository.findOne({
        where: { name: createCurriculumDto.name },
      });

      if (existingCurriculum) {
        throw new ConflictException(CURRICULUM_ERROR_MESSAGES.ALREADY_EXISTS);
      }

      const curriculum = this.curriculumRepository.create(createCurriculumDto);
      return await this.curriculumRepository.save(curriculum);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(CURRICULUM_ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  async findAll(): Promise<Curriculum[]> {
    try {
      return await this.curriculumRepository.find({
        relations: ['sessions'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(CURRICULUM_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async findOne(id: number): Promise<Curriculum> {
    try {
      const curriculum = await this.curriculumRepository.findOne({
        where: { id },
        relations: ['sessions'],
      });

      if (!curriculum) {
        throw new NotFoundException(CURRICULUM_ERROR_MESSAGES.NOT_FOUND);
      }

      return curriculum;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(CURRICULUM_ERROR_MESSAGES.INVALID_ID);
    }
  }

  async update(id: number, updateCurriculumDto: CreateCurriculumDto): Promise<Curriculum> {
    try {
      const curriculum = await this.findOne(id);

      // Check if new name conflicts with existing curriculum
      if (updateCurriculumDto.name !== curriculum.name) {
        const existingCurriculum = await this.curriculumRepository.findOne({
          where: { name: updateCurriculumDto.name },
        });

        if (existingCurriculum) {
          throw new ConflictException(CURRICULUM_ERROR_MESSAGES.ALREADY_EXISTS);
        }
      }

      Object.assign(curriculum, updateCurriculumDto);
      return await this.curriculumRepository.save(curriculum);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(CURRICULUM_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.curriculumRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(CURRICULUM_ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(CURRICULUM_ERROR_MESSAGES.DELETE_FAILED);
    }
  }
} 