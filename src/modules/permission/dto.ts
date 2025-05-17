import { PartialType } from "@nestjs/swagger";

export class CreatePermissionDto {
    name: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
