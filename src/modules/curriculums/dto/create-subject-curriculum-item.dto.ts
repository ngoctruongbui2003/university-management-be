import { IsNumber, IsNotEmpty, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateSubjectCurriculumItemDto {
  @IsNumber()
  @IsNotEmpty()
  curriculumItemId: number;

  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  credits: number;

  @IsNumber()
  @IsOptional()
  prerequisiteId?: number;
} 