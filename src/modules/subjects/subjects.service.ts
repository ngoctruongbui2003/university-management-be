import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SUBJECT_ERROR_MESSAGES } from './constants/error-messages';
import { GradingFormulasService } from '../grading-formulas/grading-formulas.service';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    private gradingFormulasService: GradingFormulasService,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      // Verify grading formula exists
      await this.gradingFormulasService.findOne(createSubjectDto.gradingFormulaId);

      // Check if subject with same name exists
      const existingSubject = await this.subjectRepository.findOne({
        where: { name: createSubjectDto.name },
      });

      if (existingSubject) {
        throw new ConflictException(SUBJECT_ERROR_MESSAGES.ALREADY_EXISTS);
      }

      const subject = this.subjectRepository.create(createSubjectDto);
      return await this.subjectRepository.save(subject);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(SUBJECT_ERROR_MESSAGES.GRADING_FORMULA_NOT_FOUND);
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  async findAll(): Promise<Subject[]> {
    try {
      return await this.subjectRepository.find({
        relations: ['gradingFormula'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async findOne(id: number): Promise<Subject> {
    try {
      const subject = await this.subjectRepository.findOne({
        where: { id },
        relations: ['gradingFormula'],
      });

      if (!subject) {
        throw new NotFoundException(SUBJECT_ERROR_MESSAGES.NOT_FOUND);
      }

      return subject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.INVALID_ID);
    }
  }

  async update(id: number, updateSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      const subject = await this.findOne(id);

      // Verify grading formula exists
      await this.gradingFormulasService.findOne(updateSubjectDto.gradingFormulaId);

      // Check if new name conflicts with existing subject
      if (updateSubjectDto.name !== subject.name) {
        const existingSubject = await this.subjectRepository.findOne({
          where: { name: updateSubjectDto.name },
        });

        if (existingSubject) {
          throw new ConflictException(SUBJECT_ERROR_MESSAGES.ALREADY_EXISTS);
        }
      }

      Object.assign(subject, updateSubjectDto);
      return await this.subjectRepository.save(subject);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.subjectRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(SUBJECT_ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.DELETE_FAILED);
    }
  }
} 