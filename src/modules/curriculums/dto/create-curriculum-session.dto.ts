import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateCurriculumSessionDto {
  @IsNumber()
  @IsNotEmpty()
  curriculumId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  totalItems: number;
} 