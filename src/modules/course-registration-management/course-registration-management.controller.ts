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
    HttpCode,
    Put,
} from '@nestjs/common';
import { CourseRegistrationManagementService } from './course-registration-management.service';
import {
    CreateCourseRegistrationDto,
    UpdateCourseRegistrationDto,
    AddClassesToCourseRegistrationDto,
    RemoveClassesFromCourseRegistrationDto,
    CreateCourseRegistrationSubjectDto,
    UpdateCourseRegistrationSubjectDto,
} from './dto/course-registration-management.dto';

@Controller('course-registration-management')
export class CourseRegistrationManagementController {
    constructor(
        private readonly courseRegistrationManagementService: CourseRegistrationManagementService,
    ) {}

    // =============== Course Registration CRUD ===============

    /**
     * Create a new course registration
     * POST /course-registration-management
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createCourseRegistration(@Body() createDto: CreateCourseRegistrationDto) {
        return await this.courseRegistrationManagementService.createCourseRegistration(createDto);
    }

    /**
     * Get all course registrations
     * GET /course-registration-management
     */
    @Get()
    async findAllCourseRegistrations() {
        return await this.courseRegistrationManagementService.findAllCourseRegistrations();
    }

    /**
     * Get course registration by ID
     * GET /course-registration-management/:id
     */
    @Get(':id')
    async findCourseRegistrationById(@Param('id', ParseIntPipe) id: number) {
        return await this.courseRegistrationManagementService.findCourseRegistrationById(id);
    }

    /**
     * Update course registration
     * PATCH /course-registration-management/:id
     */
    @Put(':id')
    async updateCourseRegistration(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateCourseRegistrationDto,
    ) {
        return await this.courseRegistrationManagementService.updateCourseRegistration(id, updateDto);
    }

    /**
     * Delete course registration
     * DELETE /course-registration-management/:id
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCourseRegistration(@Param('id', ParseIntPipe) id: number) {
        return await this.courseRegistrationManagementService.deleteCourseRegistration(id);
    }

    // =============== Course Registration Classes Management ===============

    /**
     * Add classes to course registration
     * POST /course-registration-management/:id/classes
     */
    @Post(':id/classes')
    @HttpCode(HttpStatus.CREATED)
    async addClassesToCourseRegistration(
        @Param('id', ParseIntPipe) courseRegistrationId: number,
        @Body() addClassesDto: AddClassesToCourseRegistrationDto,
    ) {
        return await this.courseRegistrationManagementService.addClassesToCourseRegistration(
            courseRegistrationId,
            addClassesDto,
        );
    }

    /**
     * Remove classes from course registration
     * DELETE /course-registration-management/:id/classes
     */
    @Delete(':id/classes')
    @HttpCode(HttpStatus.NO_CONTENT)
    async removeClassesFromCourseRegistration(
        @Param('id', ParseIntPipe) courseRegistrationId: number,
        @Body() removeClassesDto: RemoveClassesFromCourseRegistrationDto,
    ) {
        return await this.courseRegistrationManagementService.removeClassesFromCourseRegistration(
            courseRegistrationId,
            removeClassesDto,
        );
    }

    /**
     * Get classes in a course registration
     * GET /course-registration-management/:id/classes
     */
    @Get(':id/classes')
    async getCourseRegistrationClasses(@Param('id', ParseIntPipe) courseRegistrationId: number) {
        return await this.courseRegistrationManagementService.findCourseRegistrationClassesByRegistrationId(
            courseRegistrationId,
        );
    }

    // =============== Course Registration Subject Management ===============

    /**
     * Create course registration subject
     * POST /course-registration-management/:id/subjects
     */
    @Post(':id/subjects')
    @HttpCode(HttpStatus.CREATED)
    async createCourseRegistrationSubject(
        @Param('id', ParseIntPipe) courseRegistrationId: number,
        @Body() createDto: CreateCourseRegistrationSubjectDto,
    ) {
        // Override the course_registration_id from the URL
        createDto.course_registration_id = courseRegistrationId;
        return await this.courseRegistrationManagementService.createCourseRegistrationSubject(createDto);
    }

    /**
     * Update course registration subject
     * PUT /course-registration-management/subjects/:id
     */
    @Put('subjects/:id')
    async updateCourseRegistrationSubject(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateCourseRegistrationSubjectDto,
    ) {
        return await this.courseRegistrationManagementService.updateCourseRegistrationSubject(id, updateDto);
    }

    /**
     * Delete course registration subject
     * DELETE /course-registration-management/subjects/:id
     */
    @Delete(':id/subjects')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteCourseRegistrationSubject(@Param('id', ParseIntPipe) id: number) {
        return await this.courseRegistrationManagementService.deleteCourseRegistrationSubject(id);
    }

    /**
     * Get subjects by course registration ID
     * GET /course-registration-management/:id/subjects
     */
    @Get(':id/subjects')
    async getCourseRegistrationSubjects(@Param('id', ParseIntPipe) courseRegistrationId: number) {
        console.log(courseRegistrationId);
        return await this.courseRegistrationManagementService.findCourseRegistrationSubjectsByRegistrationId(
            courseRegistrationId,
        );
    }
}
