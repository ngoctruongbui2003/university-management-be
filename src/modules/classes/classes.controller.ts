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
}
