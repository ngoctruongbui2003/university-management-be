import { IsOptional, IsNumber, IsPositive, Min, Max, IsString } from 'class-validator';

export class CreateClassroomStudentGradeDto {
    @IsNumber()
    classroomId: number;

    @IsNumber()
    userId: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    qt1Grade?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    qt2Grade?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    midtermGrade?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    finalGrade?: number;
}

export class UpdateClassroomStudentGradeDto {
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    qt1Grade?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    qt2Grade?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    midtermGrade?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    finalGrade?: number;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class ClassroomStudentGradeResponseDto {
    id: number;
    classroomId: number;
    userId: number;
    qt1Grade?: number;
    qt2Grade?: number;
    midtermGrade?: number;
    finalGrade?: number;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        id: number;
        username: string;
        full_name: string;
        email: string;
    };
}
