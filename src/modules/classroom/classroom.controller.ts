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
    UploadedFile,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ClassroomService } from './classroom.service';
import {
    CreateClassroomDto,
    UpdateClassroomDto,
    CreatePostDto,
    UpdatePostDto,
    JoinClassroomDto
} from './dto/classroom.dto';
import { CreateClassroomSectionDto } from './dto/classroom-section.dto';
import { UpdateClassroomStudentGradeDto } from './dto/classroom-student-grade.dto';

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
    ) {
        return await this.classroomService.getUserClassrooms();
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
    @Get('my-classrooms/:id')
    async getClassroomById(
        @Param('id', ParseIntPipe) classroomId: number
    ) {
        return await this.classroomService.getClassroomDetail(classroomId, 0);
    }

    /**
     * Tạo post mới (với file upload)
     * POST /classrooms/:id/posts
     */
    @Post(':id/posts')
    @UseInterceptors(FileInterceptor('file')) // chỉ 1 file
    @HttpCode(HttpStatus.CREATED)
    async createPost(
        @Param('id', ParseIntPipe) classroomId: number,
        @Body() createDto: CreateClassroomSectionDto,
        @UploadedFile() file?: Express.Multer.File, // khác UploadedFiles
    ) {
        return await this.classroomService.createPost(classroomId, createDto, file);
    }

    /**
     * Lấy danh sách posts trong classroom
     * GET /classrooms/:id/posts
     */
    @Get(':id/posts')
    async getClassroomPosts(
        @Param('id', ParseIntPipe) classroomId: number,
    ) {
        return await this.classroomService.getClassroomPosts(classroomId);
    }

    /**
     * Lấy chi tiết một post cụ thể
     * GET /classrooms/:id/posts/:postId
     */
    @Get(':id/posts/:postId')
    async getPostDetail(
        @Param('id', ParseIntPipe) classroomId: number,
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        return await this.classroomService.getPostDetail(classroomId, postId);
    }

    /**
     * Download file từ post
     * GET /classrooms/:id/posts/:postId/download
     */
    @Get(':id/posts/:postId/download')
    async downloadPostFile(
        @Param('id', ParseIntPipe) classroomId: number,
        @Param('postId', ParseIntPipe) postId: number,
        @Res() res: Response,
    ) {
        return await this.classroomService.downloadPostFile(classroomId, postId, res);
    }

    /**
     * Lấy tất cả file trong classroom
     * GET /classrooms/:id/files
     */
    @Get(':id/files')
    async getClassroomFiles(
        @Param('id', ParseIntPipe) classroomId: number,
    ) {
        return await this.classroomService.getClassroomFiles(classroomId);
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

    /**
     * Lấy classroom dashboard với đầy đủ thông tin
     * GET /classrooms/:id/dashboard
     */
    @Get(':id/dashboard')
    async getClassroomDashboard(
        @Param('id', ParseIntPipe) classroomId: number,
        @Query('user_id', ParseIntPipe) userId: number
    ) {
        return await this.classroomService.getClassroomDashboard(classroomId, userId);
    }

    /**
     * Lấy danh sách members
     * GET /classrooms/:id/members
     */
    @Get(':id/members')
    async getClassroomMembers(
        @Param('id', ParseIntPipe) classroomId: number,
    ) {
        return await this.classroomService.getClassroomMembers(classroomId);
    }

    /**
     * Lấy điểm của tất cả học sinh trong classroom
     * GET /classrooms/:id/grades
     */
    @Get(':id/grades')
    async getClassroomGrades(
        @Param('id', ParseIntPipe) classroomId: number,
    ) {
        return await this.classroomService.getClassroomGrades(classroomId);
    }

    /**
     * Cập nhật điểm cho một học sinh
     * PUT /classrooms/:id/grades/:userId
     */
    @Put(':id/grades/:userId')
    async updateStudentGrade(
        @Param('id', ParseIntPipe) classroomId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() updateDto: UpdateClassroomStudentGradeDto,
    ) {
        return await this.classroomService.updateStudentGrade(classroomId, userId, updateDto);
    }
}