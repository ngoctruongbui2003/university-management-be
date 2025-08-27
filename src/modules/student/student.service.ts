import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '../../entities/student.entity';
import { Classes } from '../../entities/classes.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Classes)
    private classRepository: Repository<Classes>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    // Get class with its major and faculty relations
    const classEntity = await this.classRepository.findOne({
      where: { id: createStudentDto.class_id },
      relations: ['major', 'major.faculty'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${createStudentDto.class_id} not found`);
    }

    // Generate student code
    const studentCode = await this.generateStudentCode(
      classEntity.major.faculty.code,
      classEntity.academic_year
    );

    const student = this.studentRepository.create({
      full_name: createStudentDto.full_name,
      email: createStudentDto.email,
      phone: createStudentDto.phone,
      address: createStudentDto.address,
      gender: createStudentDto.gender,
      birth_date: createStudentDto.birth_date,
      student_code: studentCode,
      classes: classEntity, // Gán object Classes vào relationship field
    });
    
    return await this.studentRepository.save(student);
  }

  /**
   * Generate student code in format: [faculty_code][last_2_digits_of_year][5_digit_sequential_number]
   * Example: 52101006 (faculty code: 5, year: 2021, sequential: 01006)
   */
  private async generateStudentCode(facultyCode: string, academicYear: number): Promise<string> {
    // Get last 2 digits of academic year
    const yearSuffix = academicYear.toString().slice(-2);
    
    // Build the prefix (faculty code + year)
    const prefix = facultyCode + yearSuffix;
    
    // Count existing students with this prefix to get next sequential number
    const existingStudentsCount = await this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.classes', 'class')
      .innerJoin('class.major', 'major')
      .innerJoin('major.faculty', 'faculty')
      .where('faculty.code = :facultyCode', { facultyCode })
      .andWhere('class.academic_year = :academicYear', { academicYear })
      .getCount();
    
    // Generate next sequential number (5 digits, padded with zeros)
    const sequentialNumber = (existingStudentsCount + 1).toString().padStart(5, '0');
    
    return prefix + sequentialNumber;
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
