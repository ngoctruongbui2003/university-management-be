import { Injectable, BadRequestException } from '@nestjs/common';
import { extname, join } from 'path';
import { writeFile, mkdir, existsSync } from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);

export interface UploadResult {
    filename: string;
    original_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
}

@Injectable()
export class FileUploadService {
    private readonly uploadPath = 'uploads';
    private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'application/zip',
        'application/x-rar-compressed'
    ];

    /**
     * Upload file từ buffer
     */
    async uploadFile(
        buffer: Buffer,
        originalName: string,
        mimeType: string,
        subfolder: string = 'general'
    ): Promise<UploadResult> {
        // Validate file size
        if (buffer.length > this.maxFileSize) {
            throw new BadRequestException(`File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
        }

        // Validate mime type
        if (!this.allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException(`File type ${mimeType} is not allowed`);
        }

        // Generate unique filename
        const fileExtension = extname(originalName);
        const filename = `${uuidv4()}${fileExtension}`;
        
        // Create folder structure: uploads/classroom/2024/01/
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        
        const folderPath = join(this.uploadPath, subfolder, String(year), month);
        const filePath = join(folderPath, filename);

        // Ensure directory exists
        await this.ensureDirectoryExists(folderPath);

        // Write file
        await writeFileAsync(filePath, buffer);

        // Return upload result
        return {
            filename,
            original_name: originalName,
            file_url: `/${filePath.replace(/\\/g, '/')}`, // Normalize path separators
            file_size: buffer.length,
            mime_type: mimeType,
            uploaded_at: new Date().toISOString()
        };
    }

    /**
     * Upload multiple files
     */
    async uploadMultipleFiles(
        files: Array<{
            buffer: Buffer;
            originalName: string;
            mimeType: string;
        }>,
        subfolder: string = 'general'
    ): Promise<UploadResult[]> {
        const results = [];
        
        for (const file of files) {
            const result = await this.uploadFile(
                file.buffer,
                file.originalName,
                file.mimeType,
                subfolder
            );
            results.push(result);
        }

        return results;
    }

    /**
     * Đảm bảo thư mục tồn tại
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        if (!existsSync(dirPath)) {
            await mkdirAsync(dirPath, { recursive: true });
        }
    }

    /**
     * Get file URL for serving
     */
    getFileUrl(filename: string, subfolder: string = 'general'): string {
        return `/uploads/${subfolder}/${filename}`;
    }

    /**
     * Validate file before upload
     */
    validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(`File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
        }
    }

    /**
     * Get allowed file types for frontend validation
     */
    getAllowedFileTypes(): string[] {
        return this.allowedMimeTypes;
    }

    /**
     * Get max file size
     */
    getMaxFileSize(): number {
        return this.maxFileSize;
    }

    /**
     * Generate unique classroom folder
     */
    getClassroomFolder(classroomId: number): string {
        return `classroom/${classroomId}`;
    }

    /**
     * Generate unique assignment folder
     */
    getAssignmentFolder(classroomId: number, assignmentId: number): string {
        return `classroom/${classroomId}/assignments/${assignmentId}`;
    }
}