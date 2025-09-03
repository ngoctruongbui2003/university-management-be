import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto, UpdateFacultyDto } from './dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Faculties')
@Controller('faculties')
@ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class FacultyController {
    constructor(private readonly facultyService: FacultyService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Tạo khoa mới' })
    // @RequirePermissions('create:faculty')
    async create(@Body() createFacultyDto: CreateFacultyDto) {
        return await this.facultyService.create(createFacultyDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy danh sách khoa' })
    // @RequirePermissions('read:faculty')
    async findAll() {
        return await this.facultyService.findAll();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Lấy thông tin khoa theo ID' })
    // @RequirePermissions('read:faculty')
    async findOne(@Param('id') id: string) {
        return await this.facultyService.findOne(+id);
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cập nhật thông tin khoa' })
    // @RequirePermissions('update:faculty')
    async update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
        return await this.facultyService.update(+id, updateFacultyDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa khoa' })
    // @RequirePermissions('delete:faculty')
    async remove(@Param('id') id: string) {
        await this.facultyService.remove(+id);
    }

    @Get('excel/template')
    @ApiOperation({ summary: 'Tải template Excel cho import khoa' })
    async downloadTemplate(@Res() response: Response): Promise<void> {
        // Lấy buffer từ service
        const buffer = await this.facultyService.downloadExcelTemplate();

        // Thiết lập header response
        response.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=faculty_template.xlsx',
        );

        // Gửi buffer về client
        response.end(buffer);
    }

    @Get('excel/sample-data')
    @ApiOperation({ summary: 'Tải file Excel với dữ liệu mẫu 20 khoa' })
    async downloadSampleData(@Res() response: Response): Promise<void> {
        // Lấy buffer từ service với 20 khoa mẫu
        const buffer = await this.facultyService.downloadExcelWithSampleData();

        // Thiết lập header response
        response.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=faculty_sample_data.xlsx',
        );

        // Gửi buffer về client
        response.end(buffer);
    }

    @Post('excel/import')
    @ApiOperation({ summary: 'Import khoa từ file Excel' })
    @UseInterceptors(FileInterceptor('file'))
    async importFromExcel(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return {
                success: false,
                message: 'No file uploaded'
            };
        }

        const result = await this.facultyService.importFromExcel(file);
        
        return {
            success: true,
            message: `Successfully imported ${result.success} faculties`,
            data: {
                successCount: result.success,
                errorCount: result.errors.length,
                errors: result.errors
            }
        };
    }
} 