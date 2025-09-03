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
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get()
  async findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classesService.update(id, updateClassDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.remove(id);
  }

  @Get(':id/students')
  async findStudentsByClass(@Param('id', ParseIntPipe) id: number) {
    return this.classesService.findStudentsByClass(id);
  }

  @Get('students/faculty/:facultyId')
  async findStudentsByFaculty(@Param('facultyId', ParseIntPipe) facultyId: number) {
    return this.classesService.findStudentsByFaculty(facultyId);
  }

  @Get('students/major/:majorId')
  async findStudentsByMajor(@Param('majorId', ParseIntPipe) majorId: number) {
    return this.classesService.findStudentsByMajor(majorId);
  }

  @Get('students/academic-year/:year')
  async findStudentsByAcademicYear(@Param('year', ParseIntPipe) year: number) {
    return this.classesService.findStudentsByAcademicYear(year);
  }

  @Get('excel/template')
  async downloadTemplate(@Res() response: Response): Promise<void> {
    // Lấy buffer từ service
    const buffer = await this.classesService.downloadExcelTemplate();

    // Thiết lập header response
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=class_template.xlsx',
    );

    // Gửi buffer về client
    response.end(buffer);
  }

  @Get('excel/sample-data')
  async downloadSampleData(@Res() response: Response): Promise<void> {
    // Lấy buffer từ service với dữ liệu mẫu
    const buffer = await this.classesService.downloadExcelWithSampleData();

    // Thiết lập header response
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=class_sample_data.xlsx',
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

    const result = await this.classesService.importFromExcel(file);
    
    return {
      success: true,
      message: `Successfully imported ${result.success} classes`,
      data: {
        successCount: result.success,
        errorCount: result.errors.length,
        errors: result.errors
      }
    };
  }
}
