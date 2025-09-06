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
    Req,
    Request,
    UseGuards,
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
import { AddClassroomMemberDto } from './dto/classroom-member.dto';
import { ImportStudentResponseDto } from './dto/import-student.dto';
import { CreateClassroomSectionDto } from './dto/classroom-section.dto';
import { UpdateClassroomStudentGradeDto } from './dto/classroom-student-grade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

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
    ) {
        return await this.classroomService.createClassroom(createDto);
    }

    @Get()
    async getAllClassrooms() {
        return await this.classroomService.getAllClassrooms();
    }

    /**
     * Download Excel template for classroom import
     * GET /classrooms/excel/template
     */
    @Get('excel/template')
    async downloadExcelTemplate(@Res() res: Response) {
        const buffer = await this.classroomService.downloadExcelTemplate();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=classroom_template.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }

    /**
     * Download Excel with sample data
     * GET /classrooms/excel/sample
     */
    @Get('excel/sample-data')
    async downloadExcelWithSampleData(@Res() res: Response) {
        const buffer = await this.classroomService.downloadExcelWithSampleData();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=classroom_sample.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }

    /**
     * Import classrooms from Excel file
     * POST /classrooms/excel/import
     */
    @Post('excel/import')
    @UseInterceptors(FileInterceptor('file'))
    async importFromExcel(@UploadedFile() file: Express.Multer.File) {
        return await this.classroomService.importFromExcel(file);
    }

    /**
     * Download Excel template for student import to specific classroom
     * GET /classrooms/:id/students/excel/template
     */
    @Get(':id/students/excel/template')
    async downloadStudentExcelTemplate(
        @Param('id', ParseIntPipe) classroomId: number,
        @Res() res: Response
    ) {
        const buffer = await this.classroomService.downloadStudentExcelTemplate(classroomId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=student_import_template.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }

    /**
     * Download Excel with sample student data for specific classroom
     * GET /classrooms/:id/students/excel/sample-data
     */
    @Get(':id/students/excel/sample-data')
    async downloadStudentExcelWithSampleData(
        @Param('id', ParseIntPipe) classroomId: number,
        @Res() res: Response
    ) {
        const buffer = await this.classroomService.downloadStudentExcelWithSampleData(classroomId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=student_import_sample.xlsx',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    }

    /**
     * Import students from Excel file to specific classroom
     * POST /classrooms/:id/students/excel/import
     */
    @Post(':id/students/excel/import')
    @UseInterceptors(FileInterceptor('file'))
    async importStudentsFromExcel(
        @Param('id', ParseIntPipe) classroomId: number,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ImportStudentResponseDto> {
        return await this.classroomService.importStudentsFromExcel(classroomId, file);
    }

    @Put(':id')
    async updateClassroom(
        @Param('id', ParseIntPipe) classroomId: number,
        @Body() updateDto: UpdateClassroomDto
    ) {
        return await this.classroomService.updateClassroom(classroomId, updateDto);
    }

    @Delete(':id')
    async deleteClassroom(
        @Param('id', ParseIntPipe) classroomId: number,
    ) {
        return await this.classroomService.deleteClassroom(classroomId);
    }

    /**
     * Lấy danh sách classrooms của user
     * GET /classrooms/my-classrooms
     */
    @Get('my-classrooms')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    async getMyClassrooms(
        @Request() req
    ) {
        const userId = req.user.userId;
        return await this.classroomService.getUserClassrooms(userId);
    }

    /**
     * Join classroom bằng invite code
     * POST /classrooms/join
     */
    // @Post('join')
    // @HttpCode(HttpStatus.OK)
    // async joinClassroom(
    //     @Body() joinDto: JoinClassroomDto,
    //     @Query('user_id', ParseIntPipe) userId: number
    // ) {
    //     return await this.classroomService.joinClassroom(joinDto, userId);
    // }

    /**
     * Lấy chi tiết classroom
     * GET /classrooms/:id
     */
    @Get('/:id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    async getClassroomById(
        @Param('id', ParseIntPipe) classroomId: number
    ) {
        return await this.classroomService.getClassroomDetail(classroomId);
    }

    @Get('/:id/admin')
    async getClassroomByIdAdmin(
        @Param('id', ParseIntPipe) classroomId: number
    ) {
        return await this.classroomService.getClassroom(classroomId);
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

    @Get(':id/posts-by-session')
    async getClassroomPostsBySession(
        @Param('id', ParseIntPipe) classroomId: number,
    ) {
        return await this.classroomService.getClassroomPostsBySession(classroomId);
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
    // @Post('auto-create')
    // @HttpCode(HttpStatus.CREATED)
    // async testAutoCreateClassroom(
    //     @Query('course_id', ParseIntPipe) courseId: number,
    //     @Query('student_id', ParseIntPipe) studentId: number
    // ) {
    //     return await this.classroomService.autoCreateClassroom(courseId, studentId);
    // }

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
     * Lấy danh sách user có thể thêm vào classroom
     * GET /classrooms/:id/available-users
     */
    @Get(':id/available-users')
    async getAvailableUsers(
        @Param('id', ParseIntPipe) classroomId: number,
        @Query('role') role?: string,
        @Query('search') search?: string
    ) {
        return await this.classroomService.getAvailableUsers(classroomId, role, search);
    }

    /**
     * Thêm thành viên vào classroom
     * POST /classrooms/:id/members
     */
    @Post(':id/members')
    @HttpCode(HttpStatus.CREATED)
    async addClassroomMembers(
        @Param('id', ParseIntPipe) classroomId: number,
        @Body() addMemberDto: AddClassroomMemberDto
    ) {
        return await this.classroomService.addClassroomMembers(classroomId, addMemberDto);
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