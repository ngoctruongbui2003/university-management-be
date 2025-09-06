import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateClassroomScheduleDto {
    @IsNotEmpty()
    @IsNumber()
    sections: number;

    @IsNotEmpty()
    @IsString()
    schedule: string;
}

export class ClassroomScheduleResponseDto {
    id: number;
    sections: number;
    schedule: string;
    created_at: Date;
    updated_at: Date;
    classroom: {
        id: number;
        name: string;
    };
}
