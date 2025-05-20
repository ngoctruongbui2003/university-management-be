import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { Subject } from '../../entities/subject.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The subject has been successfully created.', type: Subject })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Subject with this name already exists.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grading formula not found.' })
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<Subject> {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all subjects.', type: [Subject] })
  findAll(): Promise<Subject[]> {
    return this.subjectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by id' })
  @ApiParam({ name: 'id', description: 'The id of the subject' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the subject.', type: Subject })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subject not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Subject> {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiParam({ name: 'id', description: 'The id of the subject' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The subject has been successfully updated.', type: Subject })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subject not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Subject with this name already exists.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubjectDto: CreateSubjectDto,
  ): Promise<Subject> {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiParam({ name: 'id', description: 'The id of the subject' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The subject has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Subject not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.subjectsService.remove(id);
  }
}