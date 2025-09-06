import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ImportStudentDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    full_name?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    student_code?: string;
}

export class ImportStudentResponseDto {
    success: number;
    errors: Array<{ 
        row: number; 
        username: string;
        message: string; 
    }>;
    imported_students: Array<{
        username: string;
        full_name: string;
        email: string;
        role: string;
    }>;
}
