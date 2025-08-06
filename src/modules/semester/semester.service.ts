import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { Semester } from '../../entities/semester.entity';
import { SemesterStatus } from '../../shared/constants/enum';

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
  ) {}

  async create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
    // Validate date range
    const startDate = new Date(createSemesterDto.start_date);
    const endDate = new Date(createSemesterDto.end_date);
    
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const semester = this.semesterRepository.create(createSemesterDto);
    return await this.semesterRepository.save(semester);
  }

  async findAll(): Promise<Semester[]> {
    return await this.semesterRepository.find({
      relations: ['academicYear'],
      order: { start_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['academicYear'],
    });

    if (!semester) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    return semester;
  }

  async update(id: number, updateSemesterDto: UpdateSemesterDto): Promise<Semester> {
    // Validate date range if both dates are provided
    if (updateSemesterDto.start_date && updateSemesterDto.end_date) {
      const startDate = new Date(updateSemesterDto.start_date);
      const endDate = new Date(updateSemesterDto.end_date);
      
      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const semester = await this.findOne(id);
    Object.assign(semester, updateSemesterDto);
    return await this.semesterRepository.save(semester);
  }

  async remove(id: number): Promise<void> {
    const semester = await this.findOne(id);
    await this.semesterRepository.remove(semester);
  }

  async findByAcademicYear(academicYearId: number): Promise<Semester[]> {
    return await this.semesterRepository.find({
      where: { academic_year_id: academicYearId },
      relations: ['academicYear'],
      order: { start_date: 'ASC' },
    });
  }

  async findByStatus(status: string): Promise<Semester[]> {
    if (!Object.values(SemesterStatus).includes(status as SemesterStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    return await this.semesterRepository.find({
      where: { status: status as SemesterStatus },
      relations: ['academicYear'],
      order: { start_date: 'DESC' },
    });
  }

  async closeSemester(id: number): Promise<Semester> {
    const semester = await this.findOne(id);
    semester.status = SemesterStatus.CLOSED;
    return await this.semesterRepository.save(semester);
  }

  async activateSemester(id: number): Promise<Semester> {
    const semester = await this.findOne(id);
    semester.status = SemesterStatus.ACTIVE;
    return await this.semesterRepository.save(semester);
  }
}