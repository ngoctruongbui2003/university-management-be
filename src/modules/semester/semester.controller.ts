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
import { SemesterService } from './semester.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Controller('semesters')
export class SemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSemesterDto: CreateSemesterDto) {
    return this.semesterService.create(createSemesterDto);
  }

  @Get()
  async findAll() {
    return this.semesterService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.semesterService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSemesterDto: UpdateSemesterDto,
  ) {
    return this.semesterService.update(id, updateSemesterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.semesterService.remove(id);
  }

  @Get('academic-year/:academicYearId')
  async findByAcademicYear(@Param('academicYearId', ParseIntPipe) academicYearId: number) {
    return this.semesterService.findByAcademicYear(academicYearId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.semesterService.findByStatus(status);
  }

  @Patch(':id/close')
  async closeSemester(@Param('id', ParseIntPipe) id: number) {
    return this.semesterService.closeSemester(id);
  }

  @Patch(':id/activate')
  async activateSemester(@Param('id', ParseIntPipe) id: number) {
    return this.semesterService.activateSemester(id);
  }
}