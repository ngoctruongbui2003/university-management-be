import { IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateClassroomSectionDto {
    @IsOptional()
    @IsNumber()
    classroomId?: number;

    @IsOptional()
    @IsString()
    classSectionId?: number;

    @IsOptional()
    @IsString()
    material?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    deadline?: string;

    @IsOptional()
    @IsString()
    content?: string;
}

export class UpdateClassroomSectionDto {
    @IsOptional()
    @IsNumber()
    classroomId?: number;

    @IsOptional()
    @IsNumber()
    classSectionId?: number;

    @IsOptional()
    @IsString()
    material?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    deadline?: string;

    @IsOptional()
    @IsString()
    content?: string;
}