import { PartialType } from "@nestjs/swagger";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, MinLength, IsArray, IsOptional } from "class-validator";
import { IsString } from "class-validator";
export class CreateRoleDto {
    @ApiProperty({
        description: 'Tên vai trò',
        example: 'admin',
    })
    @IsNotEmpty({ message: 'Tên vai trò không được để trống' })
    @IsString({ message: 'Tên vai trò phải là chuỗi' })
    @MinLength(3, { message: 'Tên vai trò phải có ít nhất 3 ký tự' })
    @MaxLength(50, { message: 'Tên vai trò không được vượt quá 50 ký tự' })
    name: string;

    @ApiProperty({
        description: 'Danh sách id quyền',
        example: [1, 2, 3],
    })
    @IsArray({ message: 'Danh sách id quyền phải là mảng' })
    permissionIds?: number[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
