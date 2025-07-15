import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Academic Years')
@Controller('academic-years')
@ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class AcademicYearController {
    constructor(private readonly academicYearService: AcademicYearService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo năm học mới' })
    // @RequirePermissions('create:academic-year')
    async create(@Body() createAcademicYearDto: CreateAcademicYearDto) {
        return await this.academicYearService.create(createAcademicYearDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách năm học' })
    // @RequirePermissions('read:academic-year')
    async findAll() {
        return await this.academicYearService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy thông tin năm học theo ID' })
    // @RequirePermissions('read:academic-year')
    async findOne(@Param('id') id: string) {
        return await this.academicYearService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cập nhật thông tin năm học' })
    // @RequirePermissions('update:academic-year')
    async update(@Param('id') id: string, @Body() updateAcademicYearDto: UpdateAcademicYearDto) {
        return await this.academicYearService.update(+id, updateAcademicYearDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa năm học' })
    // @RequirePermissions('delete:academic-year')
    async remove(@Param('id') id: string) {
        await this.academicYearService.remove(+id);
    }
} 