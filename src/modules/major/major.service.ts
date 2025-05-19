import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Major } from 'src/entities/major.entity';
import { Faculty } from 'src/entities/faculty.entity';
import { CreateMajorDto, UpdateMajorDto } from './dto';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';

@Injectable()
export class MajorService {
    constructor(
        @InjectRepository(Major)
        private majorRepository: Repository<Major>,
        @InjectRepository(Faculty)
        private facultyRepository: Repository<Faculty>,
    ) {}

    async create(createMajorDto: CreateMajorDto): Promise<Major> {
        // Check if faculty exists
        const faculty = await this.facultyRepository.findOneBy({ id: createMajorDto.faculty_id });
        if (!faculty) {
            throw new NotFoundException(ErrorMessages.MAJOR.FACULTY_NOT_FOUND);
        }

        // Check if name exists
        const existingName = await this.majorRepository.findOneBy({ name: createMajorDto.name });
        if (existingName) {
            throw new ConflictException(ErrorMessages.MAJOR.EXIST);
        }

        // Check if code exists
        const existingCode = await this.majorRepository.findOneBy({ code: createMajorDto.code });
        if (existingCode) {
            throw new ConflictException(ErrorMessages.MAJOR.CODE_EXIST);
        }

        const major = this.majorRepository.create(createMajorDto);
        return this.majorRepository.save(major);
    }

    async findAll(): Promise<Major[]> {
        return this.majorRepository.find({
            relations: ['faculty'],
            order: { name: 'ASC' }
        });
    }

    async findOne(id: number): Promise<Major> {
        const major = await this.majorRepository.findOne({
            where: { id },
            relations: ['faculty']
        });
        if (!major) {
            throw new NotFoundException(ErrorMessages.MAJOR.NOT_FOUND);
        }
        return major;
    }

    async update(id: number, updateMajorDto: UpdateMajorDto): Promise<Major> {
        const major = await this.findOne(id);

        // Check if faculty exists if faculty_id is being updated
        if (updateMajorDto.faculty_id) {
            const faculty = await this.facultyRepository.findOneBy({ id: updateMajorDto.faculty_id });
            if (!faculty) {
                throw new NotFoundException(ErrorMessages.MAJOR.FACULTY_NOT_FOUND);
            }
        }

        // Check if name exists if name is being updated
        if (updateMajorDto.name && updateMajorDto.name !== major.name) {
            const existingName = await this.majorRepository.findOneBy({ name: updateMajorDto.name });
            if (existingName) {
                throw new ConflictException(ErrorMessages.MAJOR.EXIST);
            }
        }

        // Check if code exists if code is being updated
        if (updateMajorDto.code && updateMajorDto.code !== major.code) {
            const existingCode = await this.majorRepository.findOneBy({ code: updateMajorDto.code });
            if (existingCode) {
                throw new ConflictException(ErrorMessages.MAJOR.CODE_EXIST);
            }
        }

        Object.assign(major, updateMajorDto);
        return this.majorRepository.save(major);
    }

    async remove(id: number): Promise<void> {
        const result = await this.majorRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(ErrorMessages.MAJOR.NOT_FOUND);
        }
    }
} 