import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '../../entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: ['classes', 'classes.major', 'classes.major.faculty'],
    });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['classes', 'classes.major', 'classes.major.faculty'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);
    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async findStudentsByFaculty(facultyId: number): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: ['classes', 'classes.major', 'classes.major.faculty'],
      where: {
        classes: {
          major: {
            faculty: {
              id: facultyId,
            },
          },
        },
      },
    });
  }

  async findStudentsByMajor(majorId: number): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: ['classes', 'classes.major', 'classes.major.faculty'],
      where: {
        classes: {
          major: {
            id: majorId,
          },
        },
      },
    });
  }

  async findStudentsByClass(classId: number): Promise<Student[]> {
    return await this.studentRepository.find({
      relations: ['classes', 'classes.major', 'classes.major.faculty'],
      where: {
        classes: {
          id: classId,
        },
      },
    });
  }
}
