import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicYear } from 'src/entities/academic-year.entity';
import { AcademicYearService } from './academic-year.service';
import { AcademicYearController } from './academic-year.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AcademicYear]),
        UserModule
    ],
    controllers: [AcademicYearController],
    providers: [AcademicYearService],
    exports: [AcademicYearService],
})
export class AcademicYearModule {} 