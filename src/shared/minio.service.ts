import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { config } from './config';
import { v4 as uuidv4 } from 'uuid';

export interface MinioUploadResult {
    filename: string;
    originalName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
    etag: string;
    objectName: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly logger = new Logger(MinioService.name);
    private minioClient: MinioClient;
    private readonly bucketName = config.minio.bucketName;

    constructor() {
        this.minioClient = new MinioClient({
            endPoint: config.minio.endPoint,
            port: config.minio.port,
            useSSL: config.minio.useSSL,
            accessKey: config.minio.accessKey,
            secretKey: config.minio.secretKey,
        });
    }

    async onModuleInit() {
        await this.ensureBucketExists();
    }

    /**
     * Ensure the bucket exists, create if it doesn't
     */
    private async ensureBucketExists(): Promise<void> {
        try {
            const bucketExists = await this.minioClient.bucketExists(this.bucketName);
            if (!bucketExists) {
                await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
                this.logger.log(`Bucket '${this.bucketName}' created successfully`);
            } else {
                this.logger.log(`Bucket '${this.bucketName}' already exists`);
            }
        } catch (error) {
            this.logger.error(`Error ensuring bucket exists: ${error.message}`);
            throw error;
        }
    }

    /**
     * Upload a single file to MinIO
     */
    async uploadFile(
        buffer: Buffer,
        originalName: string,
        mimeType: string,
        subfolder: string = 'general'
    ): Promise<MinioUploadResult> {
        try {
            // Generate unique filename
            const fileExtension = originalName.split('.').pop() || '';
            const filename = `${uuidv4()}.${fileExtension}`;
            
            // Create folder structure: subfolder/YYYY/MM/filename
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            
            const objectName = `${subfolder}/${year}/${month}/${filename}`;

            // Upload file to MinIO
            const result = await this.minioClient.putObject(
                this.bucketName,
                objectName,
                buffer,
                buffer.length,
                {
                    'Content-Type': mimeType,
                    'Content-Disposition': `attachment; filename="${originalName}"`,
                }
            );

            const fileUrl = await this.getFileUrl(objectName);

            return {
                filename,
                originalName,
                fileUrl,
                fileSize: buffer.length,
                mimeType,
                uploadedAt: new Date().toISOString(),
                etag: result.etag,
                objectName,
            };
        } catch (error) {
            this.logger.error(`Error uploading file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Upload multiple files to MinIO
     */
    async uploadMultipleFiles(
        files: Array<{
            buffer: Buffer;
            originalName: string;
            mimeType: string;
        }>,
        subfolder: string = 'general'
    ): Promise<MinioUploadResult[]> {
        const uploadPromises = files.map(file =>
            this.uploadFile(file.buffer, file.originalName, file.mimeType, subfolder)
        );
        
        return Promise.all(uploadPromises);
    }

    /**
     * Get file URL (presigned URL for temporary access)
     */
    async getFileUrl(objectName: string, expiry: number = 24 * 60 * 60): Promise<string> {
        try {
            return await this.minioClient.presignedGetObject(this.bucketName, objectName, expiry);
        } catch (error) {
            this.logger.error(`Error getting file URL: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete a file from MinIO
     */
    async deleteFile(objectName: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, objectName);
            this.logger.log(`File '${objectName}' deleted successfully`);
        } catch (error) {
            this.logger.error(`Error deleting file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Check if file exists
     */
    async fileExists(objectName: string): Promise<boolean> {
        try {
            await this.minioClient.statObject(this.bucketName, objectName);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * List files in a folder
     */
    async listFiles(prefix: string = ''): Promise<any[]> {
        try {
            const objectsStream = this.minioClient.listObjects(this.bucketName, prefix, true);
            const objects: any[] = [];
            
            return new Promise((resolve, reject) => {
                objectsStream.on('data', (obj) => objects.push(obj));
                objectsStream.on('error', reject);
                objectsStream.on('end', () => resolve(objects));
            });
        } catch (error) {
            this.logger.error(`Error listing files: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get file stream
     */
    async getFileStream(objectName: string) {
        try {
            return await this.minioClient.getObject(this.bucketName, objectName);
        } catch (error) {
            this.logger.error(`Error getting file stream: ${error.message}`);
            throw error;
        }
    }
}
