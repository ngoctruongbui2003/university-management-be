import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto, UpdateFacultyDto } from './dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Faculties')
@Controller('faculties')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FacultyController {
    constructor(private readonly facultyService: FacultyService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo khoa mới' })
    @RequirePermissions('create:faculty')
    async create(@Body() createFacultyDto: CreateFacultyDto) {
        return await this.facultyService.create(createFacultyDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách khoa' })
    @RequirePermissions('read:faculty')
    async findAll() {
        return await this.facultyService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy thông tin khoa theo ID' })
    @RequirePermissions('read:faculty')
    async findOne(@Param('id') id: string) {
        return await this.facultyService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cập nhật thông tin khoa' })
    @RequirePermissions('update:faculty')
    async update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
        return await this.facultyService.update(+id, updateFacultyDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa khoa' })
    @RequirePermissions('delete:faculty')
    async remove(@Param('id') id: string) {
        await this.facultyService.remove(+id);
    }
} 