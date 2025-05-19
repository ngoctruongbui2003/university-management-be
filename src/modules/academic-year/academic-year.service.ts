import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from 'src/entities/academic-year.entity';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto';

@Injectable()
export class AcademicYearService {
    constructor(
        @InjectRepository(AcademicYear)
        private academicYearRepository: Repository<AcademicYear>,
    ) {}

    async create(createAcademicYearDto: CreateAcademicYearDto): Promise<AcademicYear> {
        // Check if year already exists
        const existingYear = await this.academicYearRepository.findOneBy({ year: createAcademicYearDto.year });
        if (existingYear) {
            throw new ConflictException('Năm học đã tồn tại');
        }

        // Validate date range
        if (createAcademicYearDto.start_date >= createAcademicYearDto.end_date) {
            throw new ConflictException('Ngày bắt đầu phải trước ngày kết thúc');
        }

        const academicYear = this.academicYearRepository.create(createAcademicYearDto);
        return await this.academicYearRepository.save(academicYear);
    }

    async findAll(): Promise<AcademicYear[]> {
        return await this.academicYearRepository.find({
            order: {
                year: 'DESC'
            }
        });
    }

    async findOne(id: number): Promise<AcademicYear> {
        const academicYear = await this.academicYearRepository.findOneBy({ id });
        if (!academicYear) {
            throw new NotFoundException('Không tìm thấy năm học');
        }
        return academicYear;
    }

    async update(id: number, updateAcademicYearDto: UpdateAcademicYearDto): Promise<AcademicYear> {
        const academicYear = await this.findOne(id);

        // If year is being updated, check for conflicts
        if (updateAcademicYearDto.year && updateAcademicYearDto.year !== academicYear.year) {
            const existingYear = await this.academicYearRepository.findOneBy({ year: updateAcademicYearDto.year });
            if (existingYear) {
                throw new ConflictException('Năm học đã tồn tại');
            }
        }

        // Validate date range if both dates are provided
        if (updateAcademicYearDto.start_date && updateAcademicYearDto.end_date) {
            if (updateAcademicYearDto.start_date >= updateAcademicYearDto.end_date) {
                throw new ConflictException('Ngày bắt đầu phải trước ngày kết thúc');
            }
        }

        Object.assign(academicYear, updateAcademicYearDto);
        return await this.academicYearRepository.save(academicYear);
    }

    async remove(id: number): Promise<void> {
        const result = await this.academicYearRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Không tìm thấy năm học');
        }
    }
} 