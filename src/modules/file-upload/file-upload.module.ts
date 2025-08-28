import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { MinioService } from '../../shared/minio.service';

@Module({
  providers: [FileUploadService, MinioService],
  exports: [FileUploadService, MinioService],
})
export class FileUploadModule {}