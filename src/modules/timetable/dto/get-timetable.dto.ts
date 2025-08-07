import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTimetableDto {
    @IsNotEmpty()
    @IsNumber()
    student_id: number;

    @IsOptional()
    @IsNumber()
    semester_id?: number;

    @IsOptional()
    @IsDateString()
    week_start_date?: string;

    @IsOptional()
    @IsDateString()
    week_end_date?: string;
}

export class TimetableResponseDto {
    day_of_week: number;
    day_name: string;
    date: string;
    periods: PeriodDto[];
}

export class PeriodDto {
    period_number: number;
    period_time: string;
    course?: CourseInTimetableDto;
}

export class CourseInTimetableDto {
    id: number;
    class_code: string;
    subject_name: string;
    teacher_name: string;
    room: string;
    period_start: number;
    period_end: number;
    week_start: number;
    week_end: number;
    registration_status: string;
}

export class WeeklyTimetableDto {
    week_start_date: string;
    week_end_date: string;
    semester_name: string;
    student_name: string;
    student_code: string;
    days: TimetableResponseDto[];
}