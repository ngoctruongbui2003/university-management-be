import { IsString, IsEmail, IsBoolean, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'ngoctruongbui', description: 'Tên đăng nhập duy nhất' })
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    username: string;

    @ApiProperty({ example: 'Truongbui123', description: 'Mật khẩu từ 6 đến 100 ký tự' })
    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password: string;

    // @ApiProperty({ example: 1, description: 'ID của vai trò (role) người dùng' })
    // @IsInt()
    // roleId: number;

    @ApiProperty({ example: 'Ngoc Truong Bui', description: 'Họ và tên đầy đủ' })
    @IsString()
    @MaxLength(100)
    full_name: string;

    @ApiProperty({ example: 'ngoctruongbui@gmail.com', description: 'Email (không bắt buộc)', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
