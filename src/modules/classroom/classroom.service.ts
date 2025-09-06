import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not, IsNull } from 'typeorm';
import { Classroom } from '../../entities/classroom.entity';
import { ClassroomPost, PostType, FileAttachment } from '../../entities/classroom-post.entity';
import { ClassroomMember, ClassroomRole } from '../../entities/classroom-member.entity';
import { Course } from '../../entities/course.entity';
import { User } from '../../entities/user.entity';
import { ClassroomStudentGrade } from '../../entities/classroom-student-grade.entity';
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
import { 
    CreateClassroomStudentGradeDto, 
    UpdateClassroomStudentGradeDto, 
    ClassroomStudentGradeResponseDto 
} from './dto/classroom-student-grade.dto';
import { CourseData } from 'src/shared/sample/data';
import { Classes } from 'src/entities/classes.entity';
import { Subject } from 'src/entities/subject.entity';
import { CreateClassroomSectionDto } from './dto/classroom-section.dto';
import { ClassroomSection } from 'src/entities/classsroom-section.entity';

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
        
        @InjectRepository(ClassroomStudentGrade)
        private gradeRepository: Repository<ClassroomStudentGrade>,
        
        private fileUploadService: FileUploadService,
        private dataSource: DataSource,

        @InjectRepository(Subject)
        private subjectRepository: Repository<Subject>,

        @InjectRepository(ClassroomSection)
        private classroomSectionRepository: Repository<ClassroomSection>,
    ) {}

    // /**
    //  * Auto tạo classroom khi đăng ký môn thành công
    //  */
    // async autoCreateClassroom(courseId: number, studentId: number): Promise<Classroom> {
    //     // Kiểm tra classroom đã tồn tại chưa
    //     let classroom = await this.classroomRepository.findOne({
    //         where: { course_id: courseId },
    //         relations: ['course', 'course.subject', 'course.teacher']
    //     });

    //     if (!classroom) {
    //         // Tạo classroom mới
    //         const course = await this.courseRepository.findOne({
    //             where: { id: courseId },
    //             relations: ['subject', 'teacher', 'semester']
    //         });

    //         if (!course) {
    //             throw new NotFoundException('Course not found');
    //         }

    //         classroom = await this.createClassroomFromCourse(course);
    //     }

    //     // Thêm sinh viên vào classroom
    //     await this.autoJoinStudent(classroom.id, studentId);

    //     return classroom;
    // }

    /**
     * Tạo classroom từ course
     */
    // private async createClassroomFromCourse(course: any): Promise<Classroom> {
    //     const classCode = this.generateClassCode(course);
    //     const inviteCode = this.generateInviteCode();

    //     const classroom = this.classroomRepository.create({
    //         course_id: course.id,
    //         name: `${course.subject.name} - ${course.class_code}`,
    //         description: `Lớp học online cho môn ${course.subject.name}`,
    //         class_code: classCode,
    //         invite_code: inviteCode,
    //         is_active: true
    //     });

    //     const savedClassroom = await this.classroomRepository.save(classroom);

    //     // Thêm giáo viên vào classroom
    //     await this.addMember(savedClassroom.id, course.teacher_id, ClassroomRole.TEACHER);

    //     return savedClassroom;
    // }

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
    // async createClassroom(createDto: CreateClassroomDto, creatorId: number): Promise<ClassroomResponseDto> {
    //     const course = await this.courseRepository.findOne({
    //         where: { id: createDto.course_id },
    //         relations: ['subject', 'teacher', 'semester']
    //     });

    //     if (!course) {
    //         throw new NotFoundException('Course not found');
    //     }

    //     // Kiểm tra quyền tạo classroom (chỉ teacher của course)
    //     if (course.teacher_id !== creatorId) {
    //         throw new ForbiddenException('Only course teacher can create classroom');
    //     }

    //     // Kiểm tra classroom đã tồn tại
    //     const existingClassroom = await this.classroomRepository.findOne({
    //         where: { course_id: createDto.course_id }
    //     });

    //     if (existingClassroom) {
    //         throw new ConflictException('Classroom already exists for this course');
    //     }

    //     const classroom = await this.createClassroomFromCourse(course);
    //     return this.mapToResponseDto(classroom);
    // }

    private formatSemesterName(semester: string): string {
        // Input format: "HK1 2025-2026"
        // Output format: "HK1_2025"
        const [term, years] = semester.split(' ');
        const startYear = years.split('-')[0];
        return `${term}_${startYear}`;
    }

    private async getNextSectionNumber(subject_id: number, semester: string): Promise<number> {
        // Get all classrooms for this subject in this semester
        const classrooms = await this.classroomRepository.find({
            where: {
                subject: { id: subject_id },
                semester: semester
            },
            order: { name: 'DESC' } // Order by name descending to get the latest N number
        });

        if (classrooms.length === 0) {
            return 1; // First section
        }

        // Find the highest N number
        let maxN = 1;
        for (const classroom of classrooms) {
            const match = classroom.name.match(/_N(\d+)$/);
            if (match) {
                const nNumber = parseInt(match[1]);
                if (nNumber > maxN) {
                    maxN = nNumber;
                }
            }
        }

        return maxN + 1;
    }

    async createClassroom(createDto: CreateClassroomDto): Promise<Classroom> {
        // Get subject information to get credits and name
        const subject = await this.subjectRepository.findOne({
            where: { id: createDto.subject_id }
        });

        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        // Format semester name
        const formattedSemester = this.formatSemesterName(createDto.semester);

        // Get next section number (N1, N2, etc.)
        const nextN = await this.getNextSectionNumber(createDto.subject_id, createDto.semester);

        // Generate classroom name if not provided
        const name = createDto.name || `${formattedSemester}_${subject.name}_N${nextN}`;

        let teacher;
        if (createDto.teacher_username) {
            // Get teacher information
            teacher = await this.userRepository.findOne({
                where: { username: createDto.teacher_username }
            });
            if (!teacher) {
                throw new NotFoundException('Teacher not found');
            }
        }

        // Create classroom with subject credits and instructor
        const classroom = this.classroomRepository.create({
            ...createDto,
            name,
            credits: subject.credits,
            enrolled: createDto.enrolled || 0,
            is_active: createDto.is_active ?? true,
            subject: subject,
            instructor: teacher ? teacher.full_name : null
        });

        // Save classroom first to get the ID
        const savedClassroom = await this.classroomRepository.save(classroom);

        if (teacher) {
            // Add teacher to classroom member
            await this.addMember(savedClassroom.id, teacher.id, ClassroomRole.TEACHER);
        }

        return this.classroomRepository.save(classroom);
    }

    async getAllClassrooms() {
        const classrooms = await this.classroomRepository.find({
            relations: ['subject']
        });
        return classrooms;
    }

    /**
     * Lấy danh sách classroom của user
     */
    async getUserClassrooms(userId: number) {
        // Get all active memberships for the user
        const memberships = await this.memberRepository.find({
            where: {
                user_id: userId,
                is_active: true
            },
            relations: ['classroom']
        });

        if (!memberships || memberships.length === 0) {
            return [];
        }

        // Get classroom IDs from memberships
        const classroomIds = memberships.map(m => m.classroom_id);

        // Get full classroom details with all necessary relations
        const classrooms = await this.classroomRepository.find({
            where: {
                id: In(classroomIds)
            },
            relations: [
                'subject'
            ]
        });

        // Map classrooms to response format
        return classrooms.map(classroom => {
            const membership = memberships.find(m => m.classroom_id === classroom.id);
            return {
                id: classroom.id,
                name: classroom.name,
                description: classroom.description,
                credits: classroom.credits,
                sections: classroom.sections,
                schedule: classroom.schedule,
                location: classroom.location,
                enrolled: classroom.enrolled,
                is_active: classroom.is_active,
                semester: classroom.semester,
                type: classroom.type,
                instructor: classroom.instructor,
                subject: classroom.subject ? {
                    id: classroom.subject.id,
                    name: classroom.subject.name,
                    credits: classroom.subject.credits,
                    description: classroom.subject.description
                } : null,
                user_role: membership?.role || null,
                created_at: classroom.created_at,
                updated_at: classroom.updated_at
            };
        });
    }

    /**
     * Tự động generate dữ liệu course từ subject
     */
    private generateCourseData(subject: any, index: number) {
        const instructors = [
            "Mrs Trần Thị Ngọc",
            "Mrs Trần Thị Ngọc",
            "Mrs Trần Thị Ngọc", 
            "Mrs Trần Thị Ngọc",
            "Mrs Trần Thị Ngọc"
        ];

        const schedules = [
            "Monday",
            "Tuesday", 
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];

        const locations = [
            "C001", "C002", "C003", "C101", "C102", "C103",
            "B201", "B202", "B301", "A101", "A102", "A201"
        ];

        const semesters = [
            "HK1 2025-2026",
            "HK1 2025-2026", 
            "HK1 2025-2026",
            "HK1 2025-2026"
        ];

        const courseTypes = ["main", "elective", "required"];

        // Generate random but deterministic data based on subject id
        const subjectId = subject.id;
        const instructorIndex = (subjectId + index) % instructors.length;
        const scheduleIndex = (subjectId * 2 + index) % schedules.length;
        const locationIndex = (subjectId * 3 + index) % locations.length;
        const semesterIndex = Math.floor(subjectId / 3) % semesters.length;
        const typeIndex = subjectId % courseTypes.length;

        // Generate realistic enrollment numbers (50-300)
        const enrolled = 50 + ((subjectId * 47 + index * 23) % 251);
        
        // Generate rating (3.5-5.0)
        const rating = 3.5 + ((subjectId * 13 + index * 7) % 16) / 10;
        
        // Generate section number (1-5)
        const section = 1 + ((subjectId + index) % 5);

        return {
            id: subject.id,
            name: subject.name,
            code: subject.subject_code,
            description: subject.description,
            instructor: instructors[instructorIndex],
            credits: subject.credits,
            section: section === 3 ? 1 : section,
            schedule: schedules[scheduleIndex],
            location: locations[locationIndex],
            enrolled: enrolled,
            rating: Math.round(rating * 10) / 10, // Round to 1 decimal
            type: courseTypes[typeIndex],
            semester: semesters[semesterIndex],
        };
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

    async getClassroomDetail(classroomId: number): Promise<any> {
        const classroom = await this.classroomRepository.findOne({
            where: { id: classroomId },
        });
        
        return [
            {
                id: classroom.id,
                course: classroom,
                section: 1,
                name: "Section 1"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 2,
                name: "Section 2"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 3,
                name: "Section 3"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 4,
                name: "Section 4"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 5,
                name: "Section 5"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 6,
                name: "Section 6"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 7,
                name: "Section 7"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 8,
                name: "Section 8"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 9,
                name: "Section 9"
            },
            {
                id: classroom.id,
                course: classroom,
                section: 10,
                name: "Section 10"
            }
        ]
    }

    /**
     * Tạo post mới (announcement/material)
     */
    async createPost(
        classroomId: number, 
        createDto: CreateClassroomSectionDto,
        file?: Express.Multer.File
    ) {
        // // Kiểm tra quyền tạo post (teacher hoặc assistant)
        // await this.validateTeacherAccess(classroomId, creatorId);

        let uploadedFile = null;
        let filePath = null;

        // Handle single file upload if file is provided
        if (file) {
            try {
                const subfolder = this.fileUploadService.getClassroomFolder(classroomId);
                uploadedFile = await this.fileUploadService.uploadFile(
                    file.buffer,
                    file.originalname,
                    file.mimetype,
                    subfolder
                );

                // Save file information as JSON string
                filePath = JSON.stringify({
                    filename: uploadedFile.filename,
                    originalName: uploadedFile.original_name,
                    fileUrl: uploadedFile.file_url,
                    fileSize: uploadedFile.file_size,
                    mimeType: uploadedFile.mime_type,
                    uploadedAt: uploadedFile.uploaded_at,
                    objectName: uploadedFile.object_name
                });
            } catch (error) {
                throw new Error(`Failed to upload file: ${error.message}`);
            }
        }

        const classroomSection = this.classroomSectionRepository.create({
            classroomId: classroomId,
            classSectionId: createDto.classSectionId ? parseInt(createDto.classSectionId.toString()) : null,
            material: createDto.material,
            type: createDto.type,
            deadline: createDto.deadline,
            content: createDto.content,
            files: filePath
        });

        const savedClassroomSection = await this.classroomSectionRepository.save(classroomSection);

        return {
            ...savedClassroomSection,
            uploadedFile: uploadedFile
        };
    }

    /**
     * Lấy danh sách posts trong classroom
     */
    async getClassroomPosts(classroomId: number) {
        // Kiểm tra quyền truy cập
        // await this.validateMemberAccess(classroomId, userId);

        const classroomSections = await this.classroomSectionRepository.find({
            where: { classroomId: classroomId },
            order: { createdAt: 'DESC' }
        });
        return classroomSections;
    }

    /**
     * Lấy danh sách posts trong classroom nhưng gộp session lại
     */
    async getClassroomPostsBySession(classroomId: number) {
        // Kiểm tra quyền truy cập
        // await this.validateMemberAccess(classroomId, userId);

        const classroomSections = await this.classroomSectionRepository.find({
            where: { classroomId: classroomId },
            order: { createdAt: 'DESC' }
        });

        // Initialize default 10 sections as array
        const sessionPosts = [];
        for (let i = 1; i <= 10; i++) {
            sessionPosts.push({
                id: i,
                name: `Section ${i}`,
                posts: []
            });
        }

        // Add posts to their respective sections
        for (const section of classroomSections) {
            if (section.classSectionId && section.classSectionId <= 10) {
                // Array is 0-based, so subtract 1 from section ID
                sessionPosts[section.classSectionId - 1].posts.push(section);
            }
        }

        return sessionPosts;
    }

    /**
     * Lấy chi tiết một post cụ thể
     */
    async getPostDetail(classroomId: number, postId: number) {
        // Kiểm tra quyền truy cập
        // await this.validateMemberAccess(classroomId, userId);

        const classroomSection = await this.classroomSectionRepository.findOne({
            where: { 
                id: postId,
                classroomId: classroomId 
            }
        });

        if (!classroomSection) {
            throw new NotFoundException('Post not found in this classroom');
        }

        // Parse file information if exists
        let fileInfo = null;
        if (classroomSection.files) {
            try {
                fileInfo = JSON.parse(classroomSection.files);
            } catch (error) {
                console.error('Error parsing file info:', error);
            }
        }

        return {
            ...classroomSection,
            fileInfo: fileInfo
        };
    }

    /**
     * Download file từ post
     */
    async downloadPostFile(classroomId: number, postId: number, res: any) {
        // Lấy thông tin post
        const classroomSection = await this.classroomSectionRepository.findOne({
            where: { 
                id: postId,
                classroomId: classroomId 
            }
        });

        if (!classroomSection) {
            throw new NotFoundException('Post not found in this classroom');
        }

        if (!classroomSection.files) {
            throw new NotFoundException('No file attached to this post');
        }

        let fileInfo;
        console.log(classroomSection.files);
        try {
            fileInfo = JSON.parse(classroomSection.files);
        } catch (error) {
            throw new BadRequestException('Invalid file information');
        }

        try {
            let objectName = fileInfo.objectName;
            
            // Nếu không có objectName (data cũ), extract từ fileUrl
            if (!objectName) {
                try {
                    const url = new URL(fileInfo.fileUrl);
                    const pathWithoutQuery = url.pathname;
                    
                    // Remove bucket name từ path: /university-files/classroom/1/2025/08/filename.doc
                    if (pathWithoutQuery.startsWith('/university-files/')) {
                        objectName = pathWithoutQuery.substring('/university-files/'.length);
                    } else {
                        // Fallback: remove leading slash
                        objectName = pathWithoutQuery.substring(1);
                    }
                } catch (urlError) {
                    throw new BadRequestException('Cannot extract object name from file URL');
                }
            }
            
            if (!objectName) {
                throw new BadRequestException('Object name not found in file information');
            }
            
            // Get file stream từ MinIO
            const fileStream = await this.fileUploadService.getFileStream(objectName);
            
            // Set headers cho download
            res.setHeader('Content-Type', fileInfo.mimeType || 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.originalName)}"`);
            if (fileInfo.fileSize) {
                res.setHeader('Content-Length', fileInfo.fileSize.toString());
            }
            
            // Pipe stream trực tiếp tới response
            fileStream.pipe(res);
            
        } catch (error) {
            throw new BadRequestException(`Failed to download file: ${error.message}`);
        }
    }

    /**
     * Lấy tất cả file trong classroom
     */
    async getClassroomFiles(classroomId: number) {
        // Lấy tất cả posts có file trong classroom
        const classroomSections = await this.classroomSectionRepository.find({
            where: { 
                classroomId: classroomId,
                files: Not(IsNull()) // Chỉ lấy posts có file
            },
            order: { createdAt: 'DESC' }
        });

        const filesList = [];

        for (const section of classroomSections) {
            if (section.files) {
                try {
                    const fileInfo = JSON.parse(section.files);
                    
                    // Extract objectName nếu không có (backward compatibility)
                    let objectName = fileInfo.objectName;
                    if (!objectName) {
                        try {
                            const url = new URL(fileInfo.fileUrl);
                            const pathWithoutQuery = url.pathname;
                            if (pathWithoutQuery.startsWith('/university-files/')) {
                                objectName = pathWithoutQuery.substring('/university-files/'.length);
                            } else {
                                objectName = pathWithoutQuery.substring(1);
                            }
                        } catch (urlError) {
                            console.error('Error extracting object name:', urlError);
                            continue;
                        }
                    }

                    filesList.push({
                        postId: section.id,
                        postType: section.type,
                        postMaterial: section.material,
                        postContent: section.content,
                        postDeadline: section.deadline,
                        postCreatedAt: section.createdAt,
                        file: {
                            filename: fileInfo.filename,
                            originalName: fileInfo.originalName,
                            fileUrl: fileInfo.fileUrl,
                            fileSize: fileInfo.fileSize,
                            mimeType: fileInfo.mimeType,
                            uploadedAt: fileInfo.uploadedAt,
                            objectName: objectName,
                            downloadUrl: `/classrooms/${classroomId}/posts/${section.id}/download`
                        }
                    });
                } catch (parseError) {
                    console.error('Error parsing file info for section', section.id, parseError);
                    continue;
                }
            }
        }

        return {
            classroomId: classroomId,
            totalFiles: filesList.length,
            files: filesList
        };
    }

    /**
     * Join classroom bằng invite code
     */
    // async joinClassroom(joinDto: JoinClassroomDto, userId: number): Promise<void> {
    //     const classroom = await this.classroomRepository.findOne({
    //         where: { invite_code: joinDto.invite_code }
    //     });

    //     if (!classroom) {
    //         throw new NotFoundException('Invalid invite code');
    //     }

    //     if (!classroom.is_active) {
    //         throw new BadRequestException('Classroom is not active');
    //     }

    //     // Kiểm tra đã là thành viên chưa
    //     const existingMember = await this.memberRepository.findOne({
    //         where: { 
    //             classroom_id: classroom.id, 
    //             user_id: userId 
    //         }
    //     });

    //     if (existingMember) {
    //         throw new ConflictException('Already a member of this classroom');
    //     }

    //     await this.addMember(classroom.id, userId, ClassroomRole.STUDENT);
    // }

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
    async getClassroomMembers(classroomId: number): Promise<any> {
        // await this.validateMemberAccess(classroomId, userId);

        const members = await this.memberRepository.find({
            where: { classroom_id: classroomId, is_active: true },
            relations: ['user'],
            order: { role: 'ASC', joined_at: 'ASC' }
        });

        return members.map(member => ({
            id: member.id,
            user_id: member.user_id,
            role: member.role,
            joined_at: member.joined_at,
            is_active: member.is_active,
            user: {
                id: member.user.id,
                username: member.user.username,
                full_name: member.user.full_name,
                email: member.user.email,
            }
        }));
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

    /**
     * Lấy điểm của tất cả học sinh trong classroom
     */
    async getClassroomGrades(classroomId: number): Promise<ClassroomStudentGradeResponseDto[]> {
        // Lấy tất cả học sinh trong classroom
        const students = await this.memberRepository.find({
            where: { 
                classroom_id: classroomId,
                role: ClassroomRole.STUDENT,
                is_active: true
            },
            relations: ['user']
        });

        const grades = [];

        for (const student of students) {
            // Tìm điểm của học sinh này
            let grade = await this.gradeRepository.findOne({
                where: {
                    classroomId: classroomId,
                    userId: student.user_id
                },
                relations: ['user']
            });

            // Nếu chưa có record điểm, tạo object rỗng
            if (!grade) {
                grades.push({
                    id: null,
                    classroomId: classroomId,
                    userId: student.user_id,
                    qt1Grade: null,
                    qt2Grade: null,
                    midtermGrade: null,
                    finalGrade: null,
                    createdAt: null,
                    updatedAt: null,
                    user: {
                        id: student.user.id,
                        username: student.user.username,
                        full_name: student.user.full_name,
                        email: student.user.email
                    }
                });
            } else {
                grades.push({
                    id: grade.id,
                    classroomId: grade.classroomId,
                    userId: grade.userId,
                    qt1Grade: grade.qt1Grade,
                    qt2Grade: grade.qt2Grade,
                    midtermGrade: grade.midtermGrade,
                    finalGrade: grade.finalGrade,
                    createdAt: grade.createdAt,
                    updatedAt: grade.updatedAt,
                    user: {
                        id: grade.user.id,
                        username: grade.user.username,
                        full_name: grade.user.full_name,
                        email: grade.user.email
                    }
                });
            }
        }

        return grades;
    }

    /**
     * Cập nhật điểm cho một học sinh
     */
    async updateStudentGrade(
        classroomId: number, 
        userId: number, 
        updateDto: UpdateClassroomStudentGradeDto
    ): Promise<ClassroomStudentGradeResponseDto> {
        // Kiểm tra học sinh có trong classroom không
        const studentMember = await this.memberRepository.findOne({
            where: {
                classroom_id: classroomId,
                user_id: userId,
                role: ClassroomRole.STUDENT,
                is_active: true
            }
        });

        if (!studentMember) {
            throw new NotFoundException('Student not found in this classroom');
        }

        // Tìm hoặc tạo mới record điểm
        let grade = await this.gradeRepository.findOne({
            where: {
                classroomId: classroomId,
                userId: userId
            }
        });

        if (!grade) {
            // Tạo mới nếu chưa có
            grade = this.gradeRepository.create({
                classroomId: classroomId,
                userId: userId,
                qt1Grade: updateDto.qt1Grade,
                qt2Grade: updateDto.qt2Grade,
                midtermGrade: updateDto.midtermGrade,
                finalGrade: updateDto.finalGrade
            });
        } else {
            // Cập nhật nếu đã có
            if (updateDto.qt1Grade !== undefined) grade.qt1Grade = updateDto.qt1Grade;
            if (updateDto.qt2Grade !== undefined) grade.qt2Grade = updateDto.qt2Grade;
            if (updateDto.midtermGrade !== undefined) grade.midtermGrade = updateDto.midtermGrade;
            if (updateDto.finalGrade !== undefined) grade.finalGrade = updateDto.finalGrade;
        }

        const savedGrade = await this.gradeRepository.save(grade);

        // Lấy thông tin user
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        return {
            id: savedGrade.id,
            classroomId: savedGrade.classroomId,
            userId: savedGrade.userId,
            qt1Grade: savedGrade.qt1Grade,
            qt2Grade: savedGrade.qt2Grade,
            midtermGrade: savedGrade.midtermGrade,
            finalGrade: savedGrade.finalGrade,
            createdAt: savedGrade.createdAt,
            updatedAt: savedGrade.updatedAt,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email
            }
        };
    }
}