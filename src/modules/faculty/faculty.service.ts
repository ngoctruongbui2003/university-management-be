import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from 'src/entities/faculty.entity';
import { CreateFacultyDto, UpdateFacultyDto } from './dto';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';

@Injectable()
export class FacultyService {
    constructor(
        @InjectRepository(Faculty)
        private facultyRepository: Repository<Faculty>,
    ) {}

    async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
        const existing = await this.facultyRepository.findOneBy({ name: createFacultyDto.name });
        if (existing) {
            throw new ConflictException(ErrorMessages.FACULTY.EXIST);
        }
        const faculty = this.facultyRepository.create(createFacultyDto);
        return this.facultyRepository.save(faculty);
    }

    async findAll(): Promise<Faculty[]> {
        return this.facultyRepository.find({ order: { name: 'ASC' } });
    }

    async findOne(id: number): Promise<Faculty> {
        const faculty = await this.facultyRepository.findOneBy({ id });
        if (!faculty) throw new NotFoundException(ErrorMessages.FACULTY.NOT_FOUND);
        return faculty;
    }

    async update(id: number, updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
        const faculty = await this.findOne(id);
        if (updateFacultyDto.name && updateFacultyDto.name !== faculty.name) {
            const existing = await this.facultyRepository.findOneBy({ name: updateFacultyDto.name });
            if (existing) throw new ConflictException(ErrorMessages.FACULTY.EXIST);
        }
        Object.assign(faculty, updateFacultyDto);
        return this.facultyRepository.save(faculty);
    }

    async remove(id: number): Promise<void> {
        const result = await this.facultyRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(ErrorMessages.FACULTY.NOT_FOUND);
    }
} 