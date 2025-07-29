import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GradeType } from '../../entities/grade-type.entity';
import { CreateGradeTypeDto } from './dto/create-grade-type.dto';
import { GRADE_TYPE_ERROR_MESSAGES } from './constants/error-messages';
import { GradingFormulasService } from './grading-formulas.service';

@Injectable()
export class GradeTypesService {
  constructor(
    @InjectRepository(GradeType)
    private gradeTypeRepository: Repository<GradeType>,
    private gradingFormulasService: GradingFormulasService,
  ) {}

  async create(createGradeTypeDto: CreateGradeTypeDto): Promise<GradeType> {
    try {
      // Verify grading formula exists
      await this.gradingFormulasService.findOne(createGradeTypeDto.gradingFormulaId);

      // Check if grade type already exists for this formula
      const existingGradeType = await this.gradeTypeRepository.findOne({
        where: {
          gradingFormulaId: createGradeTypeDto.gradingFormulaId,
          gradeType: createGradeTypeDto.gradeType,
        },
      });

      if (existingGradeType) {
        throw new ConflictException(GRADE_TYPE_ERROR_MESSAGES.ALREADY_EXISTS);
      }

      // Calculate total weight
      const totalWeight = await this.calculateTotalWeight(createGradeTypeDto.gradingFormulaId);
      if (totalWeight + createGradeTypeDto.weight > 100) {
        throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.INVALID_WEIGHT);
      }

      const gradeType = this.gradeTypeRepository.create(createGradeTypeDto);
      return await this.gradeTypeRepository.save(gradeType);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  async findAll(): Promise<GradeType[]> {
    try {
      return await this.gradeTypeRepository.find({
        relations: ['gradingFormula'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async findOne(id: number): Promise<GradeType> {
    try {
      const gradeType = await this.gradeTypeRepository.findOne({
        where: { id },
        relations: ['gradingFormula'],
      });

      if (!gradeType) {
        throw new NotFoundException(GRADE_TYPE_ERROR_MESSAGES.NOT_FOUND);
      }

      return gradeType;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.INVALID_ID);
    }
  }

  async findByGradingFormula(gradingFormulaId: number): Promise<GradeType[]> {
    try {
      // Verify grading formula exists
      await this.gradingFormulasService.findOne(gradingFormulaId);

      return await this.gradeTypeRepository.find({
        where: { gradingFormulaId },
        relations: ['gradingFormula'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(GRADE_TYPE_ERROR_MESSAGES.FORMULA_NOT_FOUND);
      }
      throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async update(id: number, updateGradeTypeDto: CreateGradeTypeDto): Promise<GradeType> {
    try {
      const gradeType = await this.findOne(id);

      // Verify grading formula exists
      await this.gradingFormulasService.findOne(updateGradeTypeDto.gradingFormulaId);

      // Check if grade type already exists for this formula (excluding current grade type)
      if (updateGradeTypeDto.gradeType !== gradeType.gradeType) {
        const existingGradeType = await this.gradeTypeRepository.findOne({
          where: {
            gradingFormulaId: updateGradeTypeDto.gradingFormulaId,
            gradeType: updateGradeTypeDto.gradeType,
          },
        });

        if (existingGradeType) {
          throw new ConflictException(GRADE_TYPE_ERROR_MESSAGES.ALREADY_EXISTS);
        }
      }

      // Calculate total weight excluding current grade type
      const totalWeight = await this.calculateTotalWeight(updateGradeTypeDto.gradingFormulaId, id);
      if (totalWeight + updateGradeTypeDto.weight > 100) {
        throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.INVALID_WEIGHT);
      }

      Object.assign(gradeType, updateGradeTypeDto);
      return await this.gradeTypeRepository.save(gradeType);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.gradeTypeRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(GRADE_TYPE_ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(GRADE_TYPE_ERROR_MESSAGES.DELETE_FAILED);
    }
  }

  private async calculateTotalWeight(gradingFormulaId: number, excludeGradeTypeId?: number): Promise<number> {
    const query = this.gradeTypeRepository
      .createQueryBuilder('gradeType')
      .select('SUM(gradeType.weight)', 'total')
      .where('gradeType.gradingFormulaId = :gradingFormulaId', { gradingFormulaId });

    if (excludeGradeTypeId) {
      query.andWhere('gradeType.id != :excludeGradeTypeId', { excludeGradeTypeId });
    }

    const result = await query.getRawOne();
    return result?.total || 0;
  }
} 