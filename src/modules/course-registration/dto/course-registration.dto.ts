import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { RegistrationStatus } from '../../../shared/constants/enum';

export class RegisterCourseDto {
    @IsNotEmpty()
    @IsNumber()
    student_id: number;

    @IsNotEmpty()
    @IsNumber()
    course_id: number;

    @IsNotEmpty()
    @IsNumber()
    registration_session_id: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class RegistrationResponseDto {
    id: number;
    student_id: number;
    course_id: number;
    registration_session_id: number;
    status: RegistrationStatus;
    registered_at: Date;
    notes: string;
    created_at: Date;
    updated_at: Date;
    student?: {
        id: number;
        full_name: string;
        email: string;
        classes: {
            id: number;
            class_code: string;
            major: {
                id: number;
                name: string;
                faculty: {
                    id: number;
                    name: string;
                };
            };
        };
    };
    course?: {
        id: number;
        class_code: string;
        max_students: number;
        current_students: number;
        subject: {
            id: number;
            name: string;
            code: string;
            credits: number;
        };
        teacher: {
            id: number;
            full_name: string;
        };
        schedules: {
            id: number;
            day_of_week: number;
            period_start: number;
            period_end: number;
            week_start: number;
            week_end: number;
            room: string;
        }[];
    };
}