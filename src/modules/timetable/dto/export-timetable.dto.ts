import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';

export enum ExportFormat {
    JSON = 'json',
    PDF = 'pdf',
    EXCEL = 'excel'
}

export class ExportTimetableDto {
    @IsNotEmpty()
    @IsNumber()
    student_id: number;

    @IsOptional()
    @IsNumber()
    semester_id?: number;

    @IsOptional()
    @IsString()
    week_start_date?: string;

    @IsOptional()
    @IsEnum(ExportFormat)
    format?: ExportFormat = ExportFormat.JSON;

    @IsOptional()
    @IsString()
    filename?: string;
}

export class TimetableConflictDto {
    course1: {
        id: number;
        class_code: string;
        subject_name: string;
    };
    course2: {
        id: number;
        class_code: string;
        subject_name: string;
    };
    conflict_details: {
        day_of_week: number;
        day_name: string;
        period_start: number;
        period_end: number;
        week_overlap: {
            start: number;
            end: number;
        };
    };
}