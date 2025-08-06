import { IsNotEmpty, IsString, IsDateString, IsOptional, MaxLength, IsNumber, IsEnum } from 'class-validator';
import { SemesterStatus } from '../../../shared/constants/enum';

export class CreateSemesterDto {
    @IsNotEmpty()
    @IsNumber()
    academic_year_id: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    name: string;

    @IsNotEmpty()
    @IsDateString()
    start_date: string;

    @IsNotEmpty()
    @IsDateString()
    end_date: string;

    @IsOptional()
    @IsEnum(SemesterStatus)
    status?: SemesterStatus;

    @IsOptional()
    @IsString()
    description?: string;
}