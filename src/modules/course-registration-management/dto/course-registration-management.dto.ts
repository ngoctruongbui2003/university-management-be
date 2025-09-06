import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CourseRegistrationStatus } from '../../../shared/constants/enum';

// Course Registration DTOs
export class CreateCourseRegistrationDto {
    @IsNotEmpty()
    @IsNumber()
    semester_id: number;

    @IsNotEmpty()
    @IsDateString()
    start_date: string;

    @IsNotEmpty()
    @IsDateString()
    end_date: string;

    @IsOptional()
    @IsEnum(CourseRegistrationStatus)
    status?: CourseRegistrationStatus;

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateCourseRegistrationDto {
    @IsOptional()
    @IsNumber()
    semester_id?: number;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @IsEnum(CourseRegistrationStatus)
    status?: CourseRegistrationStatus;

    @IsOptional()
    @IsString()
    description?: string;
}

// Course Registration Classes DTOs
export class AddClassesToCourseRegistrationDto {
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    class_ids: number[];
}

export class RemoveClassesFromCourseRegistrationDto {
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    class_ids: number[];
}

// Course Registration Subject DTOs
export class CreateCourseRegistrationSubjectDto {
    @IsOptional()
    @IsNumber()
    course_registration_id: number;

    @IsNotEmpty()
    @IsNumber()
    subject_id: number;

    @IsNotEmpty()
    @IsDateString()
    start_date: string;

    @IsNotEmpty()
    @IsDateString()
    end_date: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    max_student: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCourseRegistrationScheduleDto)
    schedules?: CreateCourseRegistrationScheduleDto[];
}

export class UpdateCourseRegistrationSubjectDto {
    @IsOptional()
    @IsNumber()
    subject_id?: number;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    max_student?: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateCourseRegistrationScheduleDto)
    schedules?: UpdateCourseRegistrationScheduleDto[];
}

// Course Registration Schedule DTOs
export class CreateCourseRegistrationScheduleDto {
    @IsNotEmpty()
    @IsNumber()
    sections: number;

    @IsNotEmpty()
    @IsString()
    schedule: string;
}

export class UpdateCourseRegistrationScheduleDto {
    @IsOptional()
    @IsNumber()
    sections?: number;

    @IsOptional()
    @IsString()
    schedule?: string;
}

// Response DTOs
export class CourseRegistrationResponseDto {
    id: number;
    semester_id: number;
    start_date: Date;
    end_date: Date;
    status: CourseRegistrationStatus;
    description: string;
    created_at: Date;
    updated_at: Date;
    semester?: {
        id: number;
        name: string;
        start_date: Date;
        end_date: Date;
    };
    courseRegistrationClasses?: CourseRegistrationClassesResponseDto[];
    courseRegistrationSubjects?: CourseRegistrationSubjectResponseDto[];
}

export class CourseRegistrationClassesResponseDto {
    id: number;
    course_registration_id: number;
    class_id: number;
    created_at: Date;
    updated_at: Date;
    class?: {
        id: number;
        class_code: string;
        description: string;
        academic_year: number;
        major?: {
            id: number;
            name: string;
        };
    };
}

export class CourseRegistrationSubjectResponseDto {
    id: number;
    course_registration_id: number;
    subject_id: number;
    start_date: Date;
    end_date: Date;
    max_student: number;
    description: string;
    location: string;
    semester_id: number;
    created_at: Date;
    updated_at: Date;
    subject?: {
        id: number;
        name: string;
        credits: number;
        description: string;
    };
    courseRegistrationSchedules?: CourseRegistrationScheduleResponseDto[];
}

export class CourseRegistrationScheduleResponseDto {
    id: number;
    course_registration_subject_id: number;
    sections: number;
    schedule: string;
    created_at: Date;
    updated_at: Date;
}
