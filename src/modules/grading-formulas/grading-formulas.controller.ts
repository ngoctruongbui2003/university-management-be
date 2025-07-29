import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { GradingFormulasService } from './grading-formulas.service';
import { CreateGradingFormulaDto } from './dto/create-grading-formula.dto';
import { GradingFormula } from '../../entities/grading-formula.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Grading Formulas')
@Controller('grading-formulas')
export class GradingFormulasController {
  constructor(private readonly gradingFormulasService: GradingFormulasService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new grading formula' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The grading formula has been successfully created.', type: GradingFormula })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Grading formula with this name already exists.' })
  create(@Body() createGradingFormulaDto: CreateGradingFormulaDto): Promise<GradingFormula> {
    return this.gradingFormulasService.create(createGradingFormulaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all grading formulas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all grading formulas.', type: [GradingFormula] })
  findAll(): Promise<GradingFormula[]> {
    return this.gradingFormulasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a grading formula by id' })
  @ApiParam({ name: 'id', description: 'The id of the grading formula' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the grading formula.', type: GradingFormula })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grading formula not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<GradingFormula> {
    return this.gradingFormulasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a grading formula' })
  @ApiParam({ name: 'id', description: 'The id of the grading formula' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The grading formula has been successfully updated.', type: GradingFormula })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grading formula not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Grading formula with this name already exists.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradingFormulaDto: CreateGradingFormulaDto,
  ): Promise<GradingFormula> {
    return this.gradingFormulasService.update(id, updateGradingFormulaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a grading formula' })
  @ApiParam({ name: 'id', description: 'The id of the grading formula' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The grading formula has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grading formula not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.gradingFormulasService.remove(id);
  }
} 