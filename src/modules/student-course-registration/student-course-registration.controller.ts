import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    ParseIntPipe,
    HttpStatus,
    HttpCode,
    UseGuards,
    Request,
} from '@nestjs/common';
import { StudentCourseRegistrationService } from './student-course-registration.service';
import {
    RegisterForSubjectDto,
    BatchRegisterSubjectsDto,
    BatchRegisterUsersDto,
    BatchUnregisterUsersDto,
    UpdateRegistrationStatusDto,
    GetRegistrationHistoryDto,
    GetStudentSubjectsBySemesterDto,
    GetStudentsInSubjectDto,
} from './dto/student-course-registration.dto';
import { StudentRegistrationStatus } from '../../shared/constants/enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('student-course-registration')
export class StudentCourseRegistrationController {
    constructor(
        private readonly studentCourseRegistrationService: StudentCourseRegistrationService,
    ) {}

    // =============== Student APIs ===============

    /**
     * Student batch register for multiple subjects
     * POST /student-course-registration/batch-register
     */
    @Post('register')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async batchRegisterSubjects(
        @Body() batchRegisterDto: BatchRegisterSubjectsDto,
        @Request() req
    ) {
        const userId = req.user.userId;
        return await this.studentCourseRegistrationService.batchRegisterSubjects(userId, batchRegisterDto);
    }

    /**
     * Get available subjects for registration
     * GET /student-course-registration/available-subjects
     */
    @Get('available-subjects')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    async getAvailableSubjects(
        @Request() req,
    ) {
        const userId = req.user.userId;
        return await this.studentCourseRegistrationService.getAvailableSubjects(userId);
    }

    /**
     * Get student's registered subjects by semester
     * GET /student-course-registration/subjects-by-semester
     */
    @Get('subjects-by-semester')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    async getStudentSubjectsBySemester(
        @Request() req,
        @Query('semester_id', ParseIntPipe) semesterId: number,
        @Query('status') status?: StudentRegistrationStatus,
    ) {
        const filters: GetStudentSubjectsBySemesterDto = {
            semester_id: semesterId,
            status,
        };
        const userId = req.user.userId;
        return await this.studentCourseRegistrationService.getStudentSubjectsBySemester(userId, filters);
    }

    // =============== Admin APIs ===============

    /**
     * Get all registrations (Admin only)
     * GET /student-course-registration/admin/all
     */
    @Get('admin/:id')
    async getAllRegistrations(
        @Param('id', ParseIntPipe) courseRegistrationId?: number,
    ) {
        return await this.studentCourseRegistrationService.getAllRegistrations(courseRegistrationId);
    }

    @Get('admin/:id/unregistrations')
    async getAllUnregistrations(
        @Param('id', ParseIntPipe) courseRegistrationId?: number,
    ) {
        return await this.studentCourseRegistrationService.getAllUnregistrations(courseRegistrationId);
    }

    /**
     * Admin batch register multiple users for subjects
     * POST /student-course-registration/admin/batch-register-users
     */
    @Post('admin/register-users')
    @HttpCode(HttpStatus.CREATED)
    async batchRegisterUsers(
        @Body() batchRegisterUsersDto: BatchRegisterUsersDto,
        @Request() req,
    ) {
        return await this.studentCourseRegistrationService.batchRegisterUsersForSubjects(batchRegisterUsersDto);
    }

    /**
     * Admin batch unregister multiple users from a subject
     * POST /student-course-registration/admin/unregister-users
     */
    @Post('admin/unregister-users')
    @HttpCode(HttpStatus.OK)
    async batchUnregisterUsers(
        @Body() batchUnregisterUsersDto: BatchUnregisterUsersDto,
    ) {
        return await this.studentCourseRegistrationService.batchUnregisterUsersFromSubject(batchUnregisterUsersDto);
    }

    /**
     * Update registration status (Admin only)
     * PATCH /student-course-registration/admin/:id/status
     */
    @Patch('admin/:id/status')
    async updateRegistrationStatus(
        @Param('id', ParseIntPipe) registrationId: number,
        @Body() updateDto: UpdateRegistrationStatusDto,
    ) {
        return await this.studentCourseRegistrationService.updateRegistrationStatus(registrationId, updateDto);
    }

    /**
     * Get students registered in a specific subject
     * GET /student-course-registration/students-in-subject
     */
    @Get('students-in-subject')
    async getStudentsInSubject(
        @Query('course_registration_subject_id', ParseIntPipe) courseRegistrationSubjectId: number,
        @Query('status') status?: StudentRegistrationStatus,
    ) {
        const filters: GetStudentsInSubjectDto = {
            course_registration_subject_id: courseRegistrationSubjectId,
            status,
        };
        return await this.studentCourseRegistrationService.getStudentsInSubject(filters);
    }

    /**
     * Get registration details
     * GET /student-course-registration/:id
     */
    @Get(':id')
    async getRegistrationDetails(@Param('id', ParseIntPipe) registrationId: number) {
        return await this.studentCourseRegistrationService.findRegistrationWithDetails(registrationId);
    }

    // =============== Quick Info APIs ===============

    /**
     * Get registration statistics
     * GET /student-course-registration/stats
     */
    @Get('stats')
    async getRegistrationStats(
        @Query('course_registration_id') courseRegistrationId?: string,
        @Query('semester_id') semesterId?: string,
    ) {
        // This could be implemented to return summary statistics
        return {
            message: 'Registration statistics endpoint',
            filters: { courseRegistrationId, semesterId },
        };
    }
}
