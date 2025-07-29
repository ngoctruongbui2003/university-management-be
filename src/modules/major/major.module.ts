import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorService } from './major.service';
import { MajorController } from './major.controller';
import { Major } from 'src/entities/major.entity';
import { Faculty } from 'src/entities/faculty.entity';
import { UserModule } from '../user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Major, Faculty]), UserModule],
    controllers: [MajorController],
    providers: [MajorService],
    exports: [MajorService]
})
export class MajorModule {} 