import { IsOptional, IsString, IsEmail, IsDateString, MaxLength, IsNumber, IsIn } from 'class-validator';
import { Gender } from '../../../shared/constants/enum';

export class UpdateStudentDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    full_name?: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(100)
    email?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    address?: string;

    @IsOptional()
    @IsNumber()
    @IsIn([Gender.MALE, Gender.FEMALE, Gender.OTHER])
    gender?: number;

    @IsOptional()
    @IsDateString()
    birth_date?: string;

    @IsOptional()
    @IsNumber()
    class_id?: number;
}

export class StudentResponseDto {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    gender: number;
    birth_date: Date;
    created_at: Date;
    updated_at: Date;
    classes?: {
        id: number;
        class_code: string;
        description: string;
        academic_year: number;
        major: {
            id: number;
            name: string;
            code: string;
            faculty: {
                id: number;
                name: string;
                code: string;
            };
        };
    };
}
