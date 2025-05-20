import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min, Max } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(20)
  credits: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(200)
  maxStudents?: number;

  @IsNumber()
  @IsNotEmpty()
  gradingFormulaId: number;
}