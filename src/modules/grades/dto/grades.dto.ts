import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsDateString, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGradeBookEntryDto {
    @IsNotEmpty()
    @IsNumber()
    grade_type_id: number;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    max_score?: number = 10.0;

    @IsOptional()
    @IsDateString()
    due_date?: string;

    @IsOptional()
    @IsBoolean()
    is_published?: boolean = false;
}

export class UpdateGradeBookEntryDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    max_score?: number;

    @IsOptional()
    @IsDateString()
    due_date?: string;

    @IsOptional()
    @IsBoolean()
    is_published?: boolean;

    @IsOptional()
    @IsBoolean()
    is_finalized?: boolean;
}

export class CreateSingleGradeDto {
    @IsNotEmpty()
    @IsNumber()
    student_id: number;

    @IsNotEmpty()
    @IsNumber()
    grade_book_entry_id: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(10)
    score: number;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsOptional()
    @IsBoolean()
    is_published?: boolean = true;
}

export class BatchGradeInputDto {
    student_id: number;
    score: number;
    comments?: string;
}

export class CreateBatchGradesDto {
    @IsNotEmpty()
    @IsNumber()
    grade_book_entry_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BatchGradeInputDto)
    grades: BatchGradeInputDto[];

    @IsOptional()
    @IsBoolean()
    is_published?: boolean = true;
}

export class UpdateGradeDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    score?: number;

    @IsOptional()
    @IsString()
    comments?: string;

    @IsOptional()
    @IsBoolean()
    is_published?: boolean;
}

export class GradeBookEntryResponseDto {
    id: number;
    classroom_id: number;
    grade_type_id: number;
    title: string;
    description: string;
    max_score: number;
    created_by: number;
    due_date: Date;
    is_published: boolean;
    is_finalized: boolean;
    total_students: number;
    graded_students: number;
    created_at: Date;
    updated_at: Date;
    gradeType: {
        id: number;
        gradeType: string;
        weight: number;
        description: string;
    };
    createdBy: {
        id: number;
        full_name: string;
    };
    progress_percentage: number;
}

export class StudentGradeResponseDto {
    id: number;
    classroom_id: number;
    student_id: number;
    grade_type_id: number;
    score: number;
    max_score: number;
    comments: string;
    graded_by: number;
    graded_at: Date;
    is_final: boolean;
    is_published: boolean;
    created_at: Date;
    updated_at: Date;
    student: {
        id: number;
        full_name: string;
        email: string;
    };
    gradeType: {
        id: number;
        gradeType: string;
        weight: number;
    };
    gradedBy: {
        id: number;
        full_name: string;
    };
    percentage: number; // score/max_score * 100
}

export class GradeBookOverviewDto {
    classroom_info: {
        id: number;
        name: string;
        class_code: string;
        course: {
            class_code: string;
            subject: {
                name: string;
                code: string;
            };
        };
    };
    grade_types: Array<{
        id: number;
        gradeType: string;
        weight: number;
        entries_count: number;
        average_score: number;
    }>;
    students: Array<{
        id: number;
        full_name: string;
        email: string;
        grades: Array<{
            grade_type_id: number;
            grade_type: string;
            score: number;
            max_score: number;
            percentage: number;
        }>;
        final_grade: number;
        letter_grade: string;
    }>;
    statistics: {
        total_students: number;
        total_grade_types: number;
        total_entries: number;
        overall_average: number;
        grade_distribution: {
            A: number;
            B: number;
            C: number;
            D: number;
            F: number;
        };
    };
}

export class StudentGradeSummaryDto {
    student_info: {
        id: number;
        full_name: string;
        email: string;
    };
    classroom_info: {
        id: number;
        name: string;
        class_code: string;
    };
    grades_by_type: Array<{
        grade_type: string;
        weight: number;
        entries: Array<{
            title: string;
            score: number;
            max_score: number;
            percentage: number;
            graded_at: Date;
            comments: string;
        }>;
        average_score: number;
        weighted_score: number;
    }>;
    final_grade: number;
    letter_grade: string;
    ranking: {
        position: number;
        total_students: number;
        percentile: number;
    };
}

export class FinalGradeCalculationDto {
    @IsOptional()
    @IsBoolean()
    include_incomplete?: boolean = false;

    @IsOptional()
    @IsBoolean()
    save_as_final?: boolean = false;
}