import { IsOptional, IsString, IsDateString, MaxLength, IsNumber, IsEnum } from 'class-validator';
import { SemesterStatus } from '../../../shared/constants/enum';

export class UpdateSemesterDto {
    @IsOptional()
    @IsNumber()
    academic_year_id?: number;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    name?: string;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @IsEnum(SemesterStatus)
    status?: SemesterStatus;

    @IsOptional()
    @IsString()
    description?: string;
}

export class SemesterResponseDto {
    id: number;
    academic_year_id: number;
    name: string;
    start_date: Date;
    end_date: Date;
    status: SemesterStatus;
    description: string;
    created_at: Date;
    updated_at: Date;
    academicYear?: {
        id: number;
        year: number;
        is_current: boolean;
        start_date: Date;
        end_date: Date;
    };
}