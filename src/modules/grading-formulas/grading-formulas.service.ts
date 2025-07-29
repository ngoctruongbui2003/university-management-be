import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradingFormula } from '../../entities/grading-formula.entity';
import { CreateGradingFormulaDto } from './dto/create-grading-formula.dto';
import { GRADING_FORMULA_ERROR_MESSAGES } from './constants/error-messages';

@Injectable()
export class GradingFormulasService {
  constructor(
    @InjectRepository(GradingFormula)
    private gradingFormulaRepository: Repository<GradingFormula>,
  ) {}

  async create(createGradingFormulaDto: CreateGradingFormulaDto): Promise<GradingFormula> {
    try {
      // Check if formula with same name exists
      const existingFormula = await this.gradingFormulaRepository.findOne({
        where: { name: createGradingFormulaDto.name },
      });

      if (existingFormula) {
        throw new ConflictException(GRADING_FORMULA_ERROR_MESSAGES.ALREADY_EXISTS);
      }

      const gradingFormula = this.gradingFormulaRepository.create(createGradingFormulaDto);
      return await this.gradingFormulaRepository.save(gradingFormula);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(GRADING_FORMULA_ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  async findAll(): Promise<GradingFormula[]> {
    try {
      return await this.gradingFormulaRepository.find({
        relations: ['gradeTypes'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(GRADING_FORMULA_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async findOne(id: number): Promise<GradingFormula> {
    try {
      const gradingFormula = await this.gradingFormulaRepository.findOne({
        where: { id },
        relations: ['gradeTypes'],
      });

      if (!gradingFormula) {
        throw new NotFoundException(GRADING_FORMULA_ERROR_MESSAGES.NOT_FOUND);
      }

      return gradingFormula;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(GRADING_FORMULA_ERROR_MESSAGES.INVALID_ID);
    }
  }

  async update(id: number, updateGradingFormulaDto: CreateGradingFormulaDto): Promise<GradingFormula> {
    try {
      const gradingFormula = await this.findOne(id);

      // Check if new name conflicts with existing formula
      if (updateGradingFormulaDto.name !== gradingFormula.name) {
        const existingFormula = await this.gradingFormulaRepository.findOne({
          where: { name: updateGradingFormulaDto.name },
        });

        if (existingFormula) {
          throw new ConflictException(GRADING_FORMULA_ERROR_MESSAGES.ALREADY_EXISTS);
        }
      }

      Object.assign(gradingFormula, updateGradingFormulaDto);
      return await this.gradingFormulaRepository.save(gradingFormula);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(GRADING_FORMULA_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.gradingFormulaRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(GRADING_FORMULA_ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(GRADING_FORMULA_ERROR_MESSAGES.DELETE_FAILED);
    }
  }
} 