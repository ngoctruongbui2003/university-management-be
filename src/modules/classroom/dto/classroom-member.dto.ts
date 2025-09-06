import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { ClassroomRole } from '../../../entities/classroom-member.entity';

export class AddClassroomMemberDto {
    @IsNotEmpty()
    @IsArray()
    usernames: string[];

    @IsNotEmpty()
    @IsEnum(ClassroomRole)
    role: ClassroomRole;
}

export class ClassroomMemberResponseDto {
    id: number;
    user_id: number;
    classroom_id: number;
    role: ClassroomRole;
    is_active: boolean;
    joined_at: Date;
    user: {
        id: number;
        username: string;
        full_name: string;
        email: string;
    };
}
