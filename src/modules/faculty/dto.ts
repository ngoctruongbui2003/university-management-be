import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFacultyDto {
    @ApiProperty({ description: 'Tên khoa', example: 'Khoa Công nghệ Thông tin' })
    @IsNotEmpty({ message: 'Tên khoa không được để trống' })
    @IsString({ message: 'Tên khoa phải là chuỗi' })
    @MaxLength(100, { message: 'Tên khoa không được vượt quá 100 ký tự' })
    name: string;

    @ApiProperty({ description: 'Tên trưởng khoa', example: 'Nguyễn Văn A', required: false })
    @IsOptional()
    @IsString({ message: 'Tên trưởng khoa phải là chuỗi' })
    @MaxLength(100, { message: 'Tên trưởng khoa không được vượt quá 100 ký tự' })
    dean?: string;

    @ApiProperty({ description: 'Thông tin liên lạc của khoa', example: '0123456789, khoa@university.edu', required: false })
    @IsOptional()
    @IsString({ message: 'Thông tin liên lạc phải là chuỗi' })
    contact_info?: string;
}

export class UpdateFacultyDto extends PartialType(CreateFacultyDto) {} 