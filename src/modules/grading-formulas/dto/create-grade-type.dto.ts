import { IsEnum, IsNumber, IsOptional, IsString, Min, Max, IsNotEmpty } from 'class-validator';
import { GradeTypeEnum } from '../../../entities/grade-type.entity';

export class CreateGradeTypeDto {
  @IsNumber()
  @IsNotEmpty()
  gradingFormulaId: number;

  @IsEnum(GradeTypeEnum)
  @IsNotEmpty()
  gradeType: GradeTypeEnum;

  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsString()
  @IsOptional()
  description?: string;
} 