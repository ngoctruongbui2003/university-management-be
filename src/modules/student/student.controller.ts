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
  HttpCode
} from '@nestjs/common';
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
}
