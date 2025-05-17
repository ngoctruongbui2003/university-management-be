import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Tên đăng nhập',
        example: 'ngoctruongbui',
    })
    @IsNotEmpty({ message: 'Username không được để trống' })
    @IsString()
    @MinLength(4, { message: 'Username phải có ít nhất 4 ký tự' })
    @MaxLength(50, { message: 'Username không được vượt quá 50 ký tự' })
    username: string;

    @ApiProperty({
        description: 'Mật khẩu',
        example: 'Truongbui123',
    })
    @IsNotEmpty({ message: 'Password không được để trống' })
    @IsString()
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
    password: string;
}