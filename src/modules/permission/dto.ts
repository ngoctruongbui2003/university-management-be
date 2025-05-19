import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";
import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @ApiProperty({
        description: 'Tên quyền',
        example: 'create:student',
    })
    @IsNotEmpty({ message: 'Tên quyền không được để trống' })
    @IsString({ message: 'Tên vai trò phải là chuỗi' })
    @MinLength(3, { message: 'Tên quyền phải có ít nhất 3 ký tự' })
    @MaxLength(50, { message: 'Tên quyền không được vượt quá 50 ký tự' })
    name: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
