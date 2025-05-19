import { Controller, Patch, Param, Get, Post, Body, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('permission')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo quyền' })
  @RequirePermissions('create:permission')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.permissionService.create(createPermissionDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy tất cả permission' })
  @RequirePermissions('read:permission')
  async findAll() {
    return await this.permissionService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy permission theo ID' })
  @RequirePermissions('read:permission')
  async findOne(@Param('id') id: string) {
    return await this.permissionService.findOne(+id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật quyền theo ID' })
  @RequirePermissions('update:permission')
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return await this.permissionService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa quyền theo ID' })
  @RequirePermissions('delete:permission')
  async remove(@Param('id') id: string) {
    await this.permissionService.remove(+id);
  }
}
