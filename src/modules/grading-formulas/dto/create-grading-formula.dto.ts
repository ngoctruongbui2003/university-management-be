import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateGradingFormulaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
} 