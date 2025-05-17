import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  
  @Post()
  @RequirePermissions('manage:roles')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @RequirePermissions('read:roles')
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:roles')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('manage:roles')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @RequirePermissions('manage:roles')
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }

  @Post(':id/permissions/:permissionId')
  @RequirePermissions('manage:roles')
  assignPermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.roleService.assignPermission(+id, +permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  @RequirePermissions('manage:roles')
  removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.roleService.removePermission(+id, +permissionId);
  }
}
