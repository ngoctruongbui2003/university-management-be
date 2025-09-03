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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  async findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentService.remove(id);
  }

  @Get('faculty/:facultyId')
  async findStudentsByFaculty(@Param('facultyId', ParseIntPipe) facultyId: number) {
    return this.studentService.findStudentsByFaculty(facultyId);
  }

  @Get('major/:majorId')
  async findStudentsByMajor(@Param('majorId', ParseIntPipe) majorId: number) {
    return this.studentService.findStudentsByMajor(majorId);
  }

  @Get('class/:classId')
  async findStudentsByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.studentService.findStudentsByClass(classId);
  }

  @Get('excel/template')
  async downloadTemplate(@Res() response: Response): Promise<void> {
    // Lấy buffer từ service
    const buffer = await this.studentService.downloadExcelTemplate();

    // Thiết lập header response
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=student_template.xlsx',
    );

    // Gửi buffer về client
    response.end(buffer);
  }

  @Get('excel/sample-data')
  async downloadSampleData(@Res() response: Response): Promise<void> {
    // Lấy buffer từ service với 100 sinh viên mẫu
    const buffer = await this.studentService.downloadExcelWithSampleData();

    // Thiết lập header response
    response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    response.setHeader(
      'Content-Disposition',
      'attachment; filename=student_sample_data.xlsx',
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

    const result = await this.studentService.importFromExcel(file);
    
    return {
      success: true,
      message: `Successfully imported ${result.success} students`,
      data: {
        successCount: result.success,
        errorCount: result.errors.length,
        errors: result.errors
      }
    };
  }
}
