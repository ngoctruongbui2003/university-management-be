import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from 'src/entities/faculty.entity';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Faculty]), UserModule],
    controllers: [FacultyController],
    providers: [FacultyService],
    exports: [FacultyService],
})
export class FacultyModule {} 