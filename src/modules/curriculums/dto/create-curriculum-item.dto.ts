import { IsString, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateCurriculumItemDto {
    @IsNumber()
    @IsNotEmpty()
    curriculumTypeId: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    itemNumber: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
} 