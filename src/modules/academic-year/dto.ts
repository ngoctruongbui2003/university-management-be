import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsDate, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AcademicYearStatus } from 'src/entities/academic-year.entity';

export class CreateAcademicYearDto {
    @ApiProperty({
        description: 'Năm học',
        example: 2024,
    })
    @IsNotEmpty({ message: 'Năm học không được để trống' })
    @IsNumber({}, { message: 'Năm học phải là số' })
    @Min(2000, { message: 'Năm học phải lớn hơn hoặc bằng 2000' })
    @Max(2100, { message: 'Năm học phải nhỏ hơn hoặc bằng 2100' })
    year: number;

    @ApiProperty({
        description: 'Ngày bắt đầu năm học',
        example: '2024-09-01',
    })
    @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
    @IsDate({ message: 'Ngày bắt đầu không hợp lệ' })
    @Type(() => Date)
    start_date: Date;

    @ApiProperty({
        description: 'Ngày kết thúc năm học',
        example: '2025-06-30',
    })
    @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
    @IsDate({ message: 'Ngày kết thúc không hợp lệ' })
    @Type(() => Date)
    end_date: Date;

    @ApiProperty({
        description: 'Trạng thái năm học',
        enum: AcademicYearStatus,
        example: AcademicYearStatus.ACTIVE,
    })
    @IsEnum(AcademicYearStatus, { message: 'Trạng thái không hợp lệ' })
    status?: AcademicYearStatus;
}

export class UpdateAcademicYearDto extends PartialType(CreateAcademicYearDto) {} 