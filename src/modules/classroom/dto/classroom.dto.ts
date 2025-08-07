import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsArray, IsBoolean, MaxLength } from 'class-validator';
import { PostType, FileAttachment } from '../../../entities/classroom-post.entity';
import { ClassroomRole } from '../../../entities/classroom-member.entity';

export class CreateClassroomDto {
    @IsNotEmpty()
    @IsNumber()
    course_id: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string; // Auto-generated from course if not provided

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateClassroomDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(300)
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsOptional()
    @IsEnum(PostType)
    post_type?: PostType = PostType.ANNOUNCEMENT;

    @IsOptional()
    @IsBoolean()
    is_pinned?: boolean = false;
}

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    @MaxLength(300)
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsEnum(PostType)
    post_type?: PostType;

    @IsOptional()
    @IsBoolean()
    is_pinned?: boolean;
}

export class JoinClassroomDto {
    @IsNotEmpty()
    @IsString()
    invite_code: string;
}

export class ClassroomResponseDto {
    id: number;
    course_id: number;
    name: string;
    description: string;
    class_code: string;
    invite_code: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    course?: {
        id: number;
        class_code: string;
        subject: {
            name: string;
            code: string;
        };
        teacher: {
            full_name: string;
        };
        semester: {
            name: string;
        };
    };
    member_count?: number;
    recent_posts?: any[];
}

export class PostResponseDto {
    id: number;
    classroom_id: number;
    title: string;
    content: string;
    post_type: PostType;
    attachments: FileAttachment[];
    created_by: number;
    is_pinned: boolean;
    view_count: number;
    created_at: Date;
    updated_at: Date;
    creator: {
        id: number;
        full_name: string;
        role: string;
    };
    classroom: {
        id: number;
        name: string;
        class_code: string;
    };
}

export class ClassroomMemberDto {
    id: number;
    user_id: number;
    role: ClassroomRole;
    joined_at: Date;
    is_active: boolean;
    user: {
        id: number;
        full_name: string;
        email: string;
    };
}

export class FileUploadDto {
    @IsOptional()
    @IsArray()
    files?: Express.Multer.File[];
}