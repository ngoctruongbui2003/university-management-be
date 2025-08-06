import { IsNotEmpty, IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreateClassDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    description: string;

    @IsNotEmpty()
    @IsNumber()
    academic_year: number;

    @IsNotEmpty()
    @IsNumber()
    major_id: number;
}

export class UpdateClassDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    description?: string;

    @IsOptional()
    @IsNumber()
    academic_year?: number;

    @IsOptional()
    @IsNumber()
    major_id?: number;
}

export class ClassResponseDto {
    id: number;
    class_code: string;
    description: string;
    academic_year: number;
    major_id: number;
    created_at: Date;
    updated_at: Date;
    major?: {
        id: number;
        name: string;
        code: string;
        faculty: {
            id: number;
            name: string;
            code: string;
        };
    };
    students?: {
        id: number;
        full_name: string;
        email: string;
    }[];
}
