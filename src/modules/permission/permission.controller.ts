import { Controller, Patch, Param, Get, Post, Body, Delete } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @RequirePermissions('manage:permissions')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @RequirePermissions('read:permissions')
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @RequirePermissions('read:permissions')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermissions('manage:permissions')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @RequirePermissions('manage:permissions')
  remove(@Param('id') id: string) {
    return this.permissionService.remove(+id);
  }
}
