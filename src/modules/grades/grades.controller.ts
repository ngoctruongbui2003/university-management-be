import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import {
    CreateGradeBookEntryDto,
    UpdateGradeBookEntryDto,
    CreateSingleGradeDto,
    CreateBatchGradesDto,
    UpdateGradeDto,
    FinalGradeCalculationDto
} from './dto/grades.dto';

@Controller('classrooms/:classroomId/grades')
export class GradesController {
    constructor(private readonly gradesService: GradesService) {}

    /**
     * Tạo đợt chấm điểm mới
     * POST /classrooms/:classroomId/grades/entries
     */
    @Post('entries')
    @HttpCode(HttpStatus.CREATED)
    async createGradeBookEntry(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Body() createDto: CreateGradeBookEntryDto,
        @Query('teacher_id', ParseIntPipe) teacherId: number
    ) {
        return await this.gradesService.createGradeBookEntry(classroomId, createDto, teacherId);
    }

    /**
     * Lấy danh sách đợt chấm điểm
     * GET /classrooms/:classroomId/grades/entries
     */
    @Get('entries')
    async getGradeBookEntries(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        return await this.gradesService.getGradeBookEntries(classroomId, userId);
    }

    /**
     * Nhập điểm cho 1 sinh viên
     * POST /classrooms/:classroomId/grades/single
     */
    @Post('single')
    @HttpCode(HttpStatus.CREATED)
    async createSingleGrade(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Body() createDto: CreateSingleGradeDto,
        @Query('teacher_id', ParseIntPipe) teacherId: number
    ) {
        return await this.gradesService.createSingleGrade(classroomId, createDto, teacherId);
    }

    /**
     * Nhập điểm hàng loạt
     * POST /classrooms/:classroomId/grades/batch
     */
    @Post('batch')
    @HttpCode(HttpStatus.CREATED)
    async createBatchGrades(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Body() createDto: CreateBatchGradesDto,
        @Query('teacher_id', ParseIntPipe) teacherId: number
    ) {
        return await this.gradesService.createBatchGrades(classroomId, createDto, teacherId);
    }

    /**
     * Lấy sổ điểm tổng quan
     * GET /classrooms/:classroomId/grades/gradebook
     */
    @Get('gradebook')
    async getGradeBookOverview(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        return await this.gradesService.getGradeBookOverview(classroomId, userId);
    }

    /**
     * Lấy điểm chi tiết của 1 sinh viên
     * GET /classrooms/:classroomId/grades/student/:studentId
     */
    @Get('student/:studentId')
    async getStudentGradeSummary(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('requester_id', ParseIntPipe) requesterId: number
    ) {
        return await this.gradesService.getStudentGradeSummary(classroomId, studentId, requesterId);
    }

    /**
     * Tính điểm cuối kỳ
     * POST /classrooms/:classroomId/grades/calculate-final
     */
    @Post('calculate-final')
    @HttpCode(HttpStatus.OK)
    async calculateFinalGrades(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Body() calculationDto: FinalGradeCalculationDto,
        @Query('teacher_id', ParseIntPipe) teacherId: number
    ) {
        return await this.gradesService.calculateFinalGrades(classroomId, teacherId, calculationDto);
    }

    /**
     * Cập nhật đợt chấm điểm
     * PUT /classrooms/:classroomId/grades/entries/:entryId
     */
    @Put('entries/:entryId')
    async updateGradeBookEntry(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Param('entryId', ParseIntPipe) entryId: number,
        @Body() updateDto: UpdateGradeBookEntryDto,
        @Query('teacher_id', ParseIntPipe) teacherId: number
    ) {
        // Implementation would go here
        return { message: 'Update grade book entry - to be implemented' };
    }

    /**
     * Cập nhật điểm của sinh viên
     * PUT /classrooms/:classroomId/grades/:gradeId
     */
    @Put(':gradeId')
    async updateGrade(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Param('gradeId', ParseIntPipe) gradeId: number,
        @Body() updateDto: UpdateGradeDto,
        @Query('teacher_id', ParseIntPipe) teacherId: number
    ) {
        // Implementation would go here
        return { message: 'Update grade - to be implemented' };
    }

    /**
     * Xóa đợt chấm điểm
     * DELETE /classrooms/:classroomId/grades/entries/:entryId
     */
    @Delete('entries/:entryId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteGradeBookEntry(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Param('entryId', ParseIntPipe) entryId: number,
        @Query('teacher_id', ParseIntPipe) teacherId: number
    ) {
        // Implementation would go here
        return { message: 'Delete grade book entry - to be implemented' };
    }

    /**
     * Export grades to Excel/CSV
     * GET /classrooms/:classroomId/grades/export
     */
    @Get('export')
    async exportGrades(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Query('user_id', ParseIntPipe) userId: number,
        @Query('format') format: string = 'excel'
    ) {
        // Implementation would go here
        return { message: 'Export grades - to be implemented' };
    }

    /**
     * Get grade statistics
     * GET /classrooms/:classroomId/grades/statistics
     */
    @Get('statistics')
    async getGradeStatistics(
        @Param('classroomId', ParseIntPipe) classroomId: number,
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        // Implementation would go here
        return { message: 'Grade statistics - to be implemented' };
    }
}