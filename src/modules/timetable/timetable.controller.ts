import {
    Controller,
    Get,
    Query,
    Param,
    ParseIntPipe,
    ValidationPipe,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { GetTimetableDto } from './dto/get-timetable.dto';
import { TimetableTestDto } from './dto/timetable-test.dto';

@Controller('timetable')
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) {}

    /**
     * Test endpoint để kiểm tra module hoạt động
     * GET /timetable/test
     */
    @Get('test')
    testTimetableModule(): TimetableTestDto {
        return new TimetableTestDto();
    }

    /**
     * Lấy thời khóa biểu theo tuần của sinh viên
     * GET /timetable/student/:studentId/weekly
     */
    @Get('student/:studentId/weekly')
    async getWeeklyTimetable(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('semester_id') semesterId?: string,
        @Query('week_start_date') weekStartDate?: string,
        @Query('week_end_date') weekEndDate?: string,
    ) {
        const dto: GetTimetableDto = {
            student_id: studentId,
            semester_id: semesterId ? parseInt(semesterId) : undefined,
            week_start_date: weekStartDate,
            week_end_date: weekEndDate,
        };

        return await this.timetableService.getWeeklyTimetable(dto);
    }

    /**
     * Lấy tổng quan thời khóa biểu học kỳ của sinh viên
     * GET /timetable/student/:studentId/overview
     */
    @Get('student/:studentId/overview')
    async getSemesterTimetableOverview(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('semester_id') semesterId?: string,
    ) {
        const semesterIdNumber = semesterId ? parseInt(semesterId) : undefined;
        return await this.timetableService.getSemesterTimetableOverview(studentId, semesterIdNumber);
    }

    /**
     * Lấy thời khóa biểu của nhiều sinh viên (dành cho giáo viên/quản lý)
     * GET /timetable/multiple-students
     */
    @Get('multiple-students')
    async getMultipleStudentsTimetable(
        @Query('student_ids') studentIds: string,
        @Query('semester_id') semesterId?: string,
    ) {
        if (!studentIds) {
            throw new Error('student_ids parameter is required');
        }

        const studentIdArray = studentIds.split(',').map(id => parseInt(id.trim()));
        const semesterIdNumber = semesterId ? parseInt(semesterId) : undefined;

        return await this.timetableService.getMultipleStudentsTimetable(studentIdArray, semesterIdNumber);
    }

    /**
     * Lấy thời khóa biểu hiện tại (tuần này) của sinh viên
     * GET /timetable/student/:studentId/current
     */
    @Get('student/:studentId/current')
    async getCurrentWeekTimetable(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('semester_id') semesterId?: string,
    ) {
        const dto: GetTimetableDto = {
            student_id: studentId,
            semester_id: semesterId ? parseInt(semesterId) : undefined,
        };

        return await this.timetableService.getWeeklyTimetable(dto);
    }

    /**
     * Lấy thời khóa biểu theo ngày cụ thể
     * GET /timetable/student/:studentId/date/:date
     */
    @Get('student/:studentId/date/:date')
    async getDailyTimetable(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Param('date') date: string,
        @Query('semester_id') semesterId?: string,
    ) {
        // Chuyển đổi date thành week_start_date
        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        const weekStartDate = new Date(targetDate);
        weekStartDate.setDate(targetDate.getDate() + mondayOffset);

        const dto: GetTimetableDto = {
            student_id: studentId,
            semester_id: semesterId ? parseInt(semesterId) : undefined,
            week_start_date: weekStartDate.toISOString().split('T')[0],
        };

        const weeklyTimetable = await this.timetableService.getWeeklyTimetable(dto);
        
        // Lọc ra chỉ ngày được yêu cầu
        const requestedDayOfWeek = targetDate.getDay() === 0 ? 7 : targetDate.getDay();
        const dailySchedule = weeklyTimetable.days.find(day => day.day_of_week === requestedDayOfWeek);

        return {
            date: date,
            day_name: dailySchedule?.day_name,
            student_info: {
                name: weeklyTimetable.student_name,
                code: weeklyTimetable.student_code,
            },
            semester: weeklyTimetable.semester_name,
            schedule: dailySchedule || null
        };
    }

    /**
     * Kiểm tra conflict lịch học của sinh viên
     * GET /timetable/student/:studentId/conflicts
     */
    @Get('student/:studentId/conflicts')
    async checkScheduleConflicts(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('semester_id') semesterId?: string,
    ) {
        const semesterIdNumber = semesterId ? parseInt(semesterId) : undefined;
        return await this.timetableService.checkScheduleConflicts(studentId, semesterIdNumber);
    }

    /**
     * Lấy thống kê thời khóa biểu của sinh viên
     * GET /timetable/student/:studentId/statistics
     */
    @Get('student/:studentId/statistics')
    async getTimetableStatistics(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('semester_id') semesterId?: string,
    ) {
        const semesterIdNumber = semesterId ? parseInt(semesterId) : undefined;
        return await this.timetableService.getTimetableStatistics(studentId, semesterIdNumber);
    }

    /**
     * Export thời khóa biểu theo format
     * GET /timetable/student/:studentId/export
     */
    @Get('student/:studentId/export')
    async exportTimetable(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('format') format: string = 'json',
        @Query('semester_id') semesterId?: string,
        @Query('week_start_date') weekStartDate?: string,
    ) {
        const semesterIdNumber = semesterId ? parseInt(semesterId) : undefined;
        return await this.timetableService.exportTimetable(
            studentId,
            format,
            semesterIdNumber,
            weekStartDate
        );
    }
}