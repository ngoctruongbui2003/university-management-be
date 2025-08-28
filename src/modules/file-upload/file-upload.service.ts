import { Injectable, BadRequestException } from '@nestjs/common';
import { MinioService, MinioUploadResult } from '../../shared/minio.service';

export interface UploadResult {
    filename: string;
    original_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
    object_name: string;
}

@Injectable()
export class FileUploadService {
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

    constructor(private readonly minioService: MinioService) {}

    /**
     * Upload file từ buffer using MinIO
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

        // Upload to MinIO
        const minioResult = await this.minioService.uploadFile(
            buffer,
            originalName,
            mimeType,
            subfolder
        );

        // Return upload result in expected format
        return {
            filename: minioResult.filename,
            original_name: minioResult.originalName,
            file_url: minioResult.fileUrl,
            file_size: minioResult.fileSize,
            mime_type: minioResult.mimeType,
            uploaded_at: minioResult.uploadedAt,
            object_name: minioResult.objectName
        };
    }

    /**
     * Upload multiple files using MinIO
     */
    async uploadMultipleFiles(
        files: Array<{
            buffer: Buffer;
            originalName: string;
            mimeType: string;
        }>,
        subfolder: string = 'general'
    ): Promise<UploadResult[]> {
        // Validate all files first
        for (const file of files) {
            if (file.buffer.length > this.maxFileSize) {
                throw new BadRequestException(`File ${file.originalName} size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`);
            }
            if (!this.allowedMimeTypes.includes(file.mimeType)) {
                throw new BadRequestException(`File type ${file.mimeType} is not allowed for ${file.originalName}`);
            }
        }

        // Upload to MinIO
        const minioResults = await this.minioService.uploadMultipleFiles(files, subfolder);

        // Return upload results in expected format
        return minioResults.map(result => ({
            filename: result.filename,
            original_name: result.originalName,
            file_url: result.fileUrl,
            file_size: result.fileSize,
            mime_type: result.mimeType,
            uploaded_at: result.uploadedAt,
            object_name: result.objectName
        }));
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

    /**
     * Get file URL for serving from MinIO
     */
    async getFileUrl(objectName: string): Promise<string> {
        return await this.minioService.getFileUrl(objectName);
    }

    /**
     * Delete file from MinIO
     */
    async deleteFile(objectName: string): Promise<void> {
        return await this.minioService.deleteFile(objectName);
    }

    /**
     * Check if file exists in MinIO
     */
    async fileExists(objectName: string): Promise<boolean> {
        return await this.minioService.fileExists(objectName);
    }

    /**
     * Get file stream from MinIO
     */
    async getFileStream(objectName: string) {
        return await this.minioService.getFileStream(objectName);
    }
}