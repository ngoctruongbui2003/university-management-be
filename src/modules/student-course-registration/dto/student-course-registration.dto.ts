import { IsNotEmpty, IsNumber, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { StudentRegistrationStatus } from '../../../shared/constants/enum';

// Student Registration DTOs
export class BatchRegisterSubjectsDto {
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    course_registration_subject_ids: number[];

    @IsOptional()
    @IsString()
    notes?: string;
}

export class RegisterForSubjectDto {
    @IsNotEmpty()
    @IsNumber()
    course_registration_subject_id: number;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateRegistrationStatusDto {
    @IsNotEmpty()
    @IsEnum(StudentRegistrationStatus)
    status: StudentRegistrationStatus;

    @IsOptional()
    @IsString()
    rejection_reason?: string;
}

export class GetRegistrationHistoryDto {
    @IsOptional()
    @IsNumber()
    course_registration_id?: number;

    @IsOptional()
    @IsEnum(StudentRegistrationStatus)
    status?: StudentRegistrationStatus;

    @IsOptional()
    @IsNumber()
    semester_id?: number;
}

export class GetStudentSubjectsBySemesterDto {
    @IsNotEmpty()
    @IsNumber()
    semester_id: number;

    @IsOptional()
    @IsEnum(StudentRegistrationStatus)
    status?: StudentRegistrationStatus;
}

export class GetStudentsInSubjectDto {
    @IsNotEmpty()
    @IsNumber()
    course_registration_subject_id: number;

    @IsOptional()
    @IsEnum(StudentRegistrationStatus)
    status?: StudentRegistrationStatus;
}

// Response DTOs
export class StudentCourseRegistrationResponseDto {
    id: number;
    user_id: number;
    course_registration_subject_id: number;
    status: StudentRegistrationStatus;
    registered_at: Date;
    notes: string;
    rejection_reason: string;
    created_at: Date;
    updated_at: Date;
    user?: {
        id: number;
        full_name: string;
        email: string;
        role: string;
    };
    courseRegistrationSubject?: {
        id: number;
        subject_id: number;
        start_date: Date;
        end_date: Date;
        max_student: number;
        description: string;
        location: string;
        subject?: {
            id: number;
            name: string;
            credits: number;
            description: string;
        };
        courseRegistration?: {
            id: number;
            semester_id: number;
            start_date: Date;
            end_date: Date;
            status: string;
            semester?: {
                id: number;
                name: string;
            };
        };
        courseRegistrationSchedules?: {
            id: number;
            sections: number;
            schedule: string;
        }[];
    };
}

export class AvailableSubjectResponseDto {
    id: number;
    subject_id: number;
    start_date: Date;
    end_date: Date;
    max_student: number;
    current_registrations: number;
    available_slots: number;
    description: string;
    location: string;
    subject: {
        id: number;
        name: string;
        credits: number;
        description: string;
    };
    courseRegistration: {
        id: number;
        semester_id: number;
        start_date: Date;
        end_date: Date;
        status: string;
        semester: {
            id: number;
            name: string;
        };
    };
    courseRegistrationSchedules: {
        id: number;
        sections: number;
        schedule: string;
    }[];
    isRegistered: boolean;
    registrationStatus?: StudentRegistrationStatus;
}
