import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MajorService } from './major.service';
import { CreateMajorDto, UpdateMajorDto } from './dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('majors')
@ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class MajorController {
    constructor(private readonly majorService: MajorService) {}

    @Post()
    // @RequirePermissions('create:major')
    create(@Body() createMajorDto: CreateMajorDto) {
        return this.majorService.create(createMajorDto);
    }

    @Get()
    // @RequirePermissions('view:major')
    findAll() {
        return this.majorService.findAll();
    }

    @Get(':id')
    // @RequirePermissions('view:major')
    findOne(@Param('id') id: string) {
        return this.majorService.findOne(+id);
    }

    @Patch(':id')
    // @RequirePermissions('update:major')
    update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
        return this.majorService.update(+id, updateMajorDto);
    }

    @Delete(':id')
    // @RequirePermissions('delete:major')
    remove(@Param('id') id: string) {
        return this.majorService.remove(+id);
    }

    @Get('excel/template')
    @ApiOperation({ summary: 'Tải template Excel cho import ngành' })
    async downloadTemplate(@Res() response: Response): Promise<void> {
        // Lấy buffer từ service
        const buffer = await this.majorService.downloadExcelTemplate();

        // Thiết lập header response
        response.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=major_template.xlsx',
        );

        // Gửi buffer về client
        response.end(buffer);
    }

    @Get('excel/sample-data')
    @ApiOperation({ summary: 'Tải file Excel với dữ liệu mẫu các ngành' })
    async downloadSampleData(@Res() response: Response): Promise<void> {
        // Lấy buffer từ service với dữ liệu mẫu
        const buffer = await this.majorService.downloadExcelWithSampleData();

        // Thiết lập header response
        response.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        response.setHeader(
            'Content-Disposition',
            'attachment; filename=major_sample_data.xlsx',
        );

        // Gửi buffer về client
        response.end(buffer);
    }

    @Post('excel/import')
    @ApiOperation({ summary: 'Import ngành từ file Excel' })
    @UseInterceptors(FileInterceptor('file'))
    async importFromExcel(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            return {
                success: false,
                message: 'No file uploaded'
            };
        }

        const result = await this.majorService.importFromExcel(file);
        
        return {
            success: true,
            message: `Successfully imported ${result.success} majors`,
            data: {
                successCount: result.success,
                errorCount: result.errors.length,
                errors: result.errors
            }
        };
    }
} 