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
    UseInterceptors,
    UploadedFiles,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClassroomService } from './classroom.service';
import {
    CreateClassroomDto,
    UpdateClassroomDto,
    CreatePostDto,
    UpdatePostDto,
    JoinClassroomDto
} from './dto/classroom.dto';

@Controller('classrooms')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) {}

    /**
     * Tạo classroom mới (manual)
     * POST /classrooms
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createClassroom(
        @Body() createDto: CreateClassroomDto,
        @Query('creator_id', ParseIntPipe) creatorId: number
    ) {
        return await this.classroomService.createClassroom(createDto, creatorId);
    }

    /**
     * Lấy danh sách classrooms của user
     * GET /classrooms/my-classrooms
     */
    @Get('my-classrooms')
    async getMyClassrooms(
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        return await this.classroomService.getUserClassrooms(userId);
    }

    /**
     * Join classroom bằng invite code
     * POST /classrooms/join
     */
    @Post('join')
    @HttpCode(HttpStatus.OK)
    async joinClassroom(
        @Body() joinDto: JoinClassroomDto,
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        return await this.classroomService.joinClassroom(joinDto, userId);
    }

    /**
     * Lấy chi tiết classroom
     * GET /classrooms/:id
     */
    @Get(':id')
    async getClassroomById(
        @Param('id', ParseIntPipe) classroomId: number,
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        return await this.classroomService.getClassroomById(classroomId, userId);
    }

    /**
     * Tạo post mới (với file upload)
     * POST /classrooms/:id/posts
     */
    @Post(':id/posts')
    @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files
    @HttpCode(HttpStatus.CREATED)
    async createPost(
        @Param('id', ParseIntPipe) classroomId: number,
        @Body() createDto: CreatePostDto,
        @Query('creator_id', ParseIntPipe) creatorId: number,
        @UploadedFiles() files?
    ) {
        return await this.classroomService.createPost(classroomId, createDto, creatorId, files);
    }

    /**
     * Lấy danh sách posts trong classroom
     * GET /classrooms/:id/posts
     */
    @Get(':id/posts')
    async getClassroomPosts(
        @Param('id', ParseIntPipe) classroomId: number,
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        return await this.classroomService.getClassroomPosts(classroomId, userId);
    }

    /**
     * Test endpoint để tạo classroom từ course
     * POST /classrooms/auto-create
     */
    @Post('auto-create')
    @HttpCode(HttpStatus.CREATED)
    async testAutoCreateClassroom(
        @Query('course_id', ParseIntPipe) courseId: number,
        @Query('student_id', ParseIntPipe) studentId: number
    ) {
        return await this.classroomService.autoCreateClassroom(courseId, studentId);
    }
}