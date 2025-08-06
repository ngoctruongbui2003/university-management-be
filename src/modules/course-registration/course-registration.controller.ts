import {
    Controller,
    Post,
    Get,
    Patch,
    Param,
    Body,
    Query,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
    UseGuards,
} from '@nestjs/common';
import { CourseRegistrationService } from './course-registration.service';
import { RegisterCourseDto } from './dto/course-registration.dto';

@Controller('course-registration')
export class CourseRegistrationController {
    constructor(
        private readonly courseRegistrationService: CourseRegistrationService,
    ) {}

    /**
     * Đăng ký môn học
     * POST /course-registration/register
     */
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async registerCourse(@Body() registerDto: RegisterCourseDto) {
        return await this.courseRegistrationService.registerCourse(registerDto);
    }

    /**
     * Hủy đăng ký môn học
     * PATCH /course-registration/:id/cancel
     */
    @Patch(':id/cancel')
    async cancelRegistration(
        @Param('id', ParseIntPipe) registrationId: number,
        @Query('student_id', ParseIntPipe) studentId: number,
    ) {
        return await this.courseRegistrationService.cancelRegistration(registrationId, studentId);
    }

    /**
     * Lấy danh sách đăng ký của sinh viên
     * GET /course-registration/student/:studentId
     */
    @Get('student/:studentId')
    async getStudentRegistrations(
        @Param('studentId', ParseIntPipe) studentId: number,
        @Query('session_id') sessionId?: string,
    ) {
        const sessionIdNumber = sessionId ? parseInt(sessionId) : undefined;
        return await this.courseRegistrationService.getStudentRegistrations(studentId, sessionIdNumber);
    }

    /**
     * Lấy chi tiết đăng ký
     * GET /course-registration/:id
     */
    @Get(':id')
    async getRegistrationDetails(@Param('id', ParseIntPipe) registrationId: number) {
        return await this.courseRegistrationService.findRegistrationWithDetails(registrationId);
    }
}