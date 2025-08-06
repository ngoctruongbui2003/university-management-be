import { IsNotEmpty, IsString, IsEmail, IsDateString, MaxLength, IsNumber, IsIn } from 'class-validator';
import { Gender } from '../../../shared/constants/enum';

export class CreateTeacherDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    full_name: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    phone: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    address: string;

    @IsNotEmpty()
    @IsNumber()
    @IsIn([Gender.MALE, Gender.FEMALE, Gender.OTHER])
    gender: number;

    @IsNotEmpty()
    @IsDateString()
    birth_date: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    qualification: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    department: string;

    @IsNotEmpty()
    @IsNumber()
    faculty_id: number;
}
