import { IsOptional, IsString, IsEmail, IsDateString, MaxLength, IsNumber, IsIn } from 'class-validator';
import { Gender } from '../../../shared/constants/enum';

export class UpdateTeacherDto {
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
    @IsString()
    @MaxLength(100)
    qualification?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    department?: string;

    @IsOptional()
    @IsNumber()
    faculty_id?: number;
}

export class TeacherResponseDto {
    id: number;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    gender: number;
    birth_date: Date;
    qualification: string;
    department: string;
    faculty_id: number;
    created_at: Date;
    updated_at: Date;
    faculty?: {
        id: number;
        name: string;
        code: string;
        dean: string;
        contact_info: string;
    };
}
