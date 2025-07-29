import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { GradeTypesService } from './grade-types.service';
import { CreateGradeTypeDto } from './dto/create-grade-type.dto';
import { GradeType } from '../../entities/grade-type.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Grade Types')
@Controller('grade-types')
export class GradeTypesController {
  constructor(private readonly gradeTypesService: GradeTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grade type' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The grade type has been successfully created.', type: GradeType })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Grade type already exists for this formula.' })
  create(@Body() createGradeTypeDto: CreateGradeTypeDto): Promise<GradeType> {
    return this.gradeTypesService.create(createGradeTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grade types' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all grade types.', type: [GradeType] })
  findAll(): Promise<GradeType[]> {
    return this.gradeTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a grade type by id' })
  @ApiParam({ name: 'id', description: 'The id of the grade type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the grade type.', type: GradeType })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grade type not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GradeType> {
    return this.gradeTypesService.findOne(id);
  }

  @Get('formula/:gradingFormulaId')
  @ApiOperation({ summary: 'Get all grade types for a specific formula' })
  @ApiParam({ name: 'gradingFormulaId', description: 'The id of the grading formula' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all grade types for the formula.', type: [GradeType] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grading formula not found.' })
  findByGradingFormula(@Param('gradingFormulaId', ParseIntPipe) gradingFormulaId: number): Promise<GradeType[]> {
    return this.gradeTypesService.findByGradingFormula(gradingFormulaId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grade type' })
  @ApiParam({ name: 'id', description: 'The id of the grade type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The grade type has been successfully updated.', type: GradeType })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grade type not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Grade type already exists for this formula.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Total weight cannot exceed 100%.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeTypeDto: CreateGradeTypeDto,
  ): Promise<GradeType> {
    return this.gradeTypesService.update(id, updateGradeTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grade type' })
  @ApiParam({ name: 'id', description: 'The id of the grade type' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The grade type has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grade type not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.gradeTypesService.remove(id);
  }
} 