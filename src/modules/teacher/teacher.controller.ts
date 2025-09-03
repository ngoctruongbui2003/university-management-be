import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Res,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Controller('teachers')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  async findAll() {
    return this.teacherService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }

  @Get('excel/template')
  async downloadTemplate(@Res() response: Response): Promise<void> {
    // Lấy buffer từ service
    const buffer = await this.teacherService.downloadExcelTemplate();

    // Thiết lập header response
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=teacher_template.xlsx',
    );

    // Gửi buffer về client
    response.end(buffer);
  }

  @Get('excel/sample-data')
  async downloadSampleData(@Res() response: Response): Promise<void> {
    // Lấy buffer từ service với 50 giảng viên mẫu
    const buffer = await this.teacherService.downloadExcelWithSampleData();

    // Thiết lập header response
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=teacher_sample_data.xlsx',
    );

    // Gửi buffer về client
    response.end(buffer);
  }

  @Post('excel/import')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        success: false,
        message: 'No file uploaded'
      };
    }

    const result = await this.teacherService.importFromExcel(file);
    
    return {
      success: true,
      message: `Successfully imported ${result.success} teachers`,
      data: {
        successCount: result.success,
        errorCount: result.errors.length,
        errors: result.errors
      }
    };
  }
}
