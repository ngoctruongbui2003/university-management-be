import { Body, Controller, Delete, Get, Param, Patch, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('role')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo role' })
  @RequirePermissions('create:role')
  async create(@Body() createRoleDto: CreateRoleDto) {
    return await this.roleService.create(createRoleDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy tất cả role' })
  @RequirePermissions('read:role')
  async findAll() {
    return await this.roleService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy role theo ID' })
  @RequirePermissions('read:role')
  async findOne(@Param('id') id: string) {
    return await this.roleService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật role theo ID' })
  @RequirePermissions('update:role')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return await this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa role theo ID' })
  @RequirePermissions('delete:role')
  async remove(@Param('id') id: string) {
    await this.roleService.remove(+id);
  }

  // @Post(':id/permissions/:permissionId')
  // @RequirePermissions('manage:roles')
  // async assignPermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
  //   return await this.roleService.assignPermission(+id, +permissionId);
  // }

  // @Delete(':id/permissions/:permissionId')
  // @RequirePermissions('manage:roles')
  // async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
  //   return await this.roleService.removePermission(+id, +permissionId);
  // }
}
