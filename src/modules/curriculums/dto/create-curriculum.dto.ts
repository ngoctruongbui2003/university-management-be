import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min, Max, IsEnum } from 'class-validator';
import { CurriculumStatus } from '../../../entities/curriculum.entity';

export class CreateCurriculumDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(2000)
  @Max(2100)
  effectiveYear: number;

  @IsEnum(CurriculumStatus)
  @IsOptional()
  status?: CurriculumStatus;
} 