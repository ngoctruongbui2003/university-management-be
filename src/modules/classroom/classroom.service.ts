import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Classroom } from '../../entities/classroom.entity';
import { ClassroomPost, PostType, FileAttachment } from '../../entities/classroom-post.entity';
import { ClassroomMember, ClassroomRole } from '../../entities/classroom-member.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { FileUploadService } from '../file-upload/file-upload.service';
import { GradesService } from '../grades/grades.service';
import { 
    CreateClassroomDto, 
    UpdateClassroomDto, 
    CreatePostDto, 
    UpdatePostDto, 
    JoinClassroomDto,
    ClassroomResponseDto,
    PostResponseDto
} from './dto/classroom.dto';

@Injectable()
export class ClassroomService {
    constructor(
        @InjectRepository(Classroom)
        private classroomRepository: Repository<Classroom>,
        
        @InjectRepository(ClassroomPost)
        private postRepository: Repository<ClassroomPost>,
        
        @InjectRepository(ClassroomMember)
        private memberRepository: Repository<ClassroomMember>,
        
        @InjectRepository(Course)
        private courseRepository: Repository<Course>,
        
        @InjectRepository(User)
        private userRepository: Repository<User>,
        
        private fileUploadService: FileUploadService,
        private dataSource: DataSource,
    ) {}

    /**
     * Auto tạo classroom khi đăng ký môn thành công
     */
    async autoCreateClassroom(courseId: number, studentId: number): Promise<Classroom> {
        // Kiểm tra classroom đã tồn tại chưa
        let classroom = await this.classroomRepository.findOne({
            where: { course_id: courseId },
            relations: ['course', 'course.subject', 'course.teacher']
        });

        if (!classroom) {
            // Tạo classroom mới
            const course = await this.courseRepository.findOne({
                where: { id: courseId },
                relations: ['subject', 'teacher', 'semester']
            });

            if (!course) {
                throw new NotFoundException('Course not found');
            }

            classroom = await this.createClassroomFromCourse(course);
        }

        // Thêm sinh viên vào classroom
        await this.autoJoinStudent(classroom.id, studentId);

        return classroom;
    }

    /**
     * Tạo classroom từ course
     */
    private async createClassroomFromCourse(course: any): Promise<Classroom> {
        const classCode = this.generateClassCode(course);
        const inviteCode = this.generateInviteCode();

        const classroom = this.classroomRepository.create({
            course_id: course.id,
            name: `${course.subject.name} - ${course.class_code}`,
            description: `Lớp học online cho môn ${course.subject.name}`,
            class_code: classCode,
            invite_code: inviteCode,
            is_active: true
        });

        const savedClassroom = await this.classroomRepository.save(classroom);

        // Thêm giáo viên vào classroom
        await this.addMember(savedClassroom.id, course.teacher_id, ClassroomRole.TEACHER);

        return savedClassroom;
    }

    /**
     * Tự động thêm sinh viên vào classroom
     */
    async autoJoinStudent(classroomId: number, studentId: number): Promise<void> {
        // Kiểm tra đã là thành viên chưa
        const existingMember = await this.memberRepository.findOne({
            where: { 
                classroom_id: classroomId, 
                user_id: studentId 
            }
        });

        if (!existingMember) {
            await this.addMember(classroomId, studentId, ClassroomRole.STUDENT);
        }
    }

    /**
     * Thêm thành viên vào classroom
     */
    private async addMember(classroomId: number, userId: number, role: ClassroomRole): Promise<void> {
        const member = this.memberRepository.create({
            classroom_id: classroomId,
            user_id: userId,
            role: role,
            is_active: true
        });

        await this.memberRepository.save(member);
    }

    /**
     * Tạo classroom thủ công
     */
    async createClassroom(createDto: CreateClassroomDto, creatorId: number): Promise<ClassroomResponseDto> {
        const course = await this.courseRepository.findOne({
            where: { id: createDto.course_id },
            relations: ['subject', 'teacher', 'semester']
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        // Kiểm tra quyền tạo classroom (chỉ teacher của course)
        if (course.teacher_id !== creatorId) {
            throw new ForbiddenException('Only course teacher can create classroom');
        }

        // Kiểm tra classroom đã tồn tại
        const existingClassroom = await this.classroomRepository.findOne({
            where: { course_id: createDto.course_id }
        });

        if (existingClassroom) {
            throw new ConflictException('Classroom already exists for this course');
        }

        const classroom = await this.createClassroomFromCourse(course);
        return this.mapToResponseDto(classroom);
    }

    /**
     * Lấy danh sách classroom của user
     */
    async getUserClassrooms(userId: number): Promise<ClassroomResponseDto[]> {
        const memberClassrooms = await this.memberRepository.find({
            where: { 
                user_id: userId, 
                is_active: true 
            },
            relations: [
                'classroom',
                'classroom.course',
                'classroom.course.subject',
                'classroom.course.teacher',
                'classroom.course.semester'
            ]
        });

        return memberClassrooms.map(member => 
            this.mapToResponseDto(member.classroom)
        );
    }

    /**
     * Lấy chi tiết classroom
     */
    async getClassroomById(classroomId: number, userId: number): Promise<ClassroomResponseDto> {
        // Kiểm tra quyền truy cập
        await this.validateMemberAccess(classroomId, userId);

        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: [
                'course',
                'course.subject',
                'course.teacher',
                'course.semester'
            ]
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        return this.mapToResponseDto(classroom);
    }

    /**
     * Tạo post mới (announcement/material)
     */
    async createPost(
        classroomId: number, 
        createDto: CreatePostDto, 
        creatorId: number, 
        files?: Express.Multer.File[]
    ): Promise<PostResponseDto> {
        // Kiểm tra quyền tạo post (teacher hoặc assistant)
        await this.validateTeacherAccess(classroomId, creatorId);

        let attachments: FileAttachment[] = [];

        // Upload files nếu có
        if (files && files.length > 0) {
            const folderPath = this.fileUploadService.getClassroomFolder(classroomId);
            
            for (const file of files) {
                this.fileUploadService.validateFile(file);
                
                const uploadResult = await this.fileUploadService.uploadFile(
                    file.buffer,
                    file.originalname,
                    file.mimetype,
                    folderPath
                );
                
                attachments.push(uploadResult);
            }
        }

        const post = this.postRepository.create({
            classroom_id: classroomId,
            title: createDto.title,
            content: createDto.content,
            post_type: createDto.post_type || PostType.ANNOUNCEMENT,
            attachments: attachments,
            created_by: creatorId,
            is_pinned: createDto.is_pinned || false,
            view_count: 0
        });

        const savedPost = await this.postRepository.save(post);
        return this.mapPostToResponseDto(savedPost);
    }

    /**
     * Lấy danh sách posts trong classroom
     */
    async getClassroomPosts(classroomId: number, userId: number): Promise<PostResponseDto[]> {
        // Kiểm tra quyền truy cập
        await this.validateMemberAccess(classroomId, userId);

        const posts = await this.postRepository.find({
            where: { classroom_id: classroomId },
            relations: ['creator', 'classroom'],
            order: { 
                is_pinned: 'DESC',
                created_at: 'DESC' 
            }
        });

        return posts.map(post => this.mapPostToResponseDto(post));
    }

    /**
     * Join classroom bằng invite code
     */
    async joinClassroom(joinDto: JoinClassroomDto, userId: number): Promise<void> {
        const classroom = await this.classroomRepository.findOne({
            where: { invite_code: joinDto.invite_code }
        });

        if (!classroom) {
            throw new NotFoundException('Invalid invite code');
        }

        if (!classroom.is_active) {
            throw new BadRequestException('Classroom is not active');
        }

        // Kiểm tra đã là thành viên chưa
        const existingMember = await this.memberRepository.findOne({
            where: { 
                classroom_id: classroom.id, 
                user_id: userId 
            }
        });

        if (existingMember) {
            throw new ConflictException('Already a member of this classroom');
        }

        await this.addMember(classroom.id, userId, ClassroomRole.STUDENT);
    }

    /**
     * Lấy classroom dashboard với đầy đủ thông tin (posts + grades summary)
     */
    async getClassroomDashboard(classroomId: number, userId: number): Promise<any> {
        await this.validateMemberAccess(classroomId, userId);

        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
            relations: [
                'course',
                'course.subject',
                'course.teacher',
                'course.semester'
            ]
        });

        if (!classroom) {
            throw new NotFoundException('Classroom not found');
        }

        // Get recent posts
        const recentPosts = await this.postRepository.find({
            where: { classroom_id: classroomId },
            relations: ['creator'],
            order: { 
                is_pinned: 'DESC',
                created_at: 'DESC' 
            },
            take: 5 // Latest 5 posts
        });

        // Get member info
        const userMember = await this.memberRepository.findOne({
            where: { classroom_id: classroomId, user_id: userId }
        });

        // Get member count
        const memberCount = await this.memberRepository.count({
            where: { classroom_id: classroomId, is_active: true }
        });

        return {
            classroom: this.mapToResponseDto(classroom),
            user_role: userMember?.role,
            member_count: memberCount,
            recent_posts: recentPosts.map(post => this.mapPostToResponseDto(post)),
            tabs: {
                stream: { available: true, count: recentPosts.length },
                grades: { available: true, count: 0 }, // Will be populated by grades service
                assignments: { available: false, count: 0 }, // Future feature
                members: { available: true, count: memberCount }
            }
        };
    }

    /**
     * Lấy members của classroom với role info
     */
    async getClassroomMembers(classroomId: number, userId: number): Promise<any> {
        await this.validateMemberAccess(classroomId, userId);

        const members = await this.memberRepository.find({
            where: { classroom_id: classroomId, is_active: true },
            relations: ['user'],
            order: { role: 'ASC', joined_at: 'ASC' }
        });

        const groupedMembers = {
            teachers: members.filter(m => m.role === ClassroomRole.TEACHER),
            assistants: members.filter(m => m.role === ClassroomRole.ASSISTANT),
            students: members.filter(m => m.role === ClassroomRole.STUDENT)
        };

        return {
            total_count: members.length,
            teachers: groupedMembers.teachers.map(m => ({
                id: m.id,
                user_id: m.user_id,
                role: m.role,
                joined_at: m.joined_at,
                user: {
                    id: m.user.id,
                    full_name: m.user.full_name,
                    email: m.user.email
                }
            })),
            assistants: groupedMembers.assistants.map(m => ({
                id: m.id,
                user_id: m.user_id,
                role: m.role,
                joined_at: m.joined_at,
                user: {
                    id: m.user.id,
                    full_name: m.user.full_name,
                    email: m.user.email
                }
            })),
            students: groupedMembers.students.map(m => ({
                id: m.id,
                user_id: m.user_id,
                role: m.role,
                joined_at: m.joined_at,
                user: {
                    id: m.user.id,
                    full_name: m.user.full_name,
                    email: m.user.email
                }
            }))
        };
    }

    /**
     * Helper methods
     */
    private generateClassCode(course: any): string {
        const currentYear = new Date().getFullYear();
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${course.class_code}-${currentYear}-${random}`;
    }

    private generateInviteCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    private async validateMemberAccess(classroomId: number, userId: number): Promise<void> {
        const member = await this.memberRepository.findOne({
            where: { 
                classroom_id: classroomId, 
                user_id: userId,
                is_active: true 
            }
        });

        if (!member) {
            throw new ForbiddenException('Access denied to this classroom');
        }
    }

    private async validateTeacherAccess(classroomId: number, userId: number): Promise<void> {
        const member = await this.memberRepository.findOne({
            where: { 
                classroom_id: classroomId, 
                user_id: userId,
                is_active: true 
            }
        });

        if (!member || (member.role !== ClassroomRole.TEACHER && member.role !== ClassroomRole.ASSISTANT)) {
            throw new ForbiddenException('Only teachers can perform this action');
        }
    }

    private mapToResponseDto(classroom: any): ClassroomResponseDto {
        return {
            id: classroom.id,
            course_id: classroom.course_id,
            name: classroom.name,
            description: classroom.description,
            class_code: classroom.class_code,
            invite_code: classroom.invite_code,
            is_active: classroom.is_active,
            created_at: classroom.created_at,
            updated_at: classroom.updated_at,
            course: classroom.course ? {
                id: classroom.course.id,
                class_code: classroom.course.class_code,
                subject: {
                    name: classroom.course.subject?.name,
                    code: classroom.course.subject?.code
                },
                teacher: {
                    full_name: classroom.course.teacher?.full_name
                },
                semester: {
                    name: classroom.course.semester?.name
                }
            } : undefined
        };
    }

    private mapPostToResponseDto(post: any): PostResponseDto {
        return {
            id: post.id,
            classroom_id: post.classroom_id,
            title: post.title,
            content: post.content,
            post_type: post.post_type,
            attachments: post.attachments || [],
            created_by: post.created_by,
            is_pinned: post.is_pinned,
            view_count: post.view_count,
            created_at: post.created_at,
            updated_at: post.updated_at,
            creator: {
                id: post.creator?.id,
                full_name: post.creator?.full_name,
                role: post.creator?.role
            },
            classroom: {
                id: post.classroom?.id,
                name: post.classroom?.name,
                class_code: post.classroom?.class_code
            }
        };
    }
}