import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsNumber } from 'class-validator';

export class CreateMajorDto {
    @ApiProperty({ description: 'Tên ngành', example: 'Công nghệ Thông tin' })
    @IsNotEmpty({ message: 'Tên ngành không được để trống' })
    @IsString({ message: 'Tên ngành phải là chuỗi' })
    @MaxLength(100, { message: 'Tên ngành không được vượt quá 100 ký tự' })
    name: string;

    @ApiProperty({ description: 'Mã ngành', example: 'CNTT' })
    @IsNotEmpty({ message: 'Mã ngành không được để trống' })
    @IsString({ message: 'Mã ngành phải là chuỗi' })
    @MaxLength(20, { message: 'Mã ngành không được vượt quá 20 ký tự' })
    code: string;

    @ApiProperty({ description: 'Mô tả về ngành', required: false })
    @IsOptional()
    @IsString({ message: 'Mô tả phải là chuỗi' })
    description?: string;

    @ApiProperty({ description: 'ID của khoa', example: 1 })
    @IsNotEmpty({ message: 'ID khoa không được để trống' })
    @IsNumber({}, { message: 'ID khoa phải là số' })
    faculty_id: number;
}

export class UpdateMajorDto extends PartialType(CreateMajorDto) {} 