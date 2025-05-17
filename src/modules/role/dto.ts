import { PartialType } from "@nestjs/swagger";

export class CreateRoleDto {
    name: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
