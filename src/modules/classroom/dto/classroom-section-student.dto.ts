import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateStudentSubmissionDto {
    @IsOptional()
    @IsString()
    sectionId?: number;
}

export class UpdateStudentSubmissionDto {
    @IsOptional()
    @IsString()
    files?: string;
}

export class StudentSubmissionResponseDto {
    id: number;
    classroomSectionId: number;
    userId: number;
    submittedAt: Date;
    files: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        id: number;
        username: string;
        full_name: string;
        email: string;
    };
}

export class StudentSubmissionListDto {
    id: number;
    username: string;
    full_name: string;
    email: string;
    hasSubmitted: boolean;
    submittedAt?: Date;
    submissionId?: number;
    files?: any[]; // Parsed file information if submitted
}
