import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classes } from '../../entities/classes.entity';
import { Major } from '../../entities/major.entity';
import { Student } from '../../entities/student.entity';
import { CreateClassDto, UpdateClassDto } from './dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes)
    private readonly classesRepository: Repository<Classes>,
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Classes> {
    // Kiểm tra major có tồn tại không
    const major = await this.majorRepository.findOne({
      where: { id: createClassDto.major_id },
      relations: ['faculty'],
    });

    if (!major) {
      throw new NotFoundException('Major not found');
    }

    // Tạo class_code theo công thức
    const classCode = await this.generateClassCode(
      createClassDto.academic_year,
      major.code,
      major.faculty.code,
    );

    const newClass = this.classesRepository.create({
      ...createClassDto,
      class_code: classCode,
    });

    return this.classesRepository.save(newClass);
  }

  async findAll(): Promise<Classes[]> {
    return this.classesRepository.find({
      relations: ['major', 'major.faculty', 'students'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Classes> {
    const classEntity = await this.classesRepository.findOne({
      where: { id },
      relations: ['major', 'major.faculty', 'students'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return classEntity;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Classes> {
    const existingClass = await this.findOne(id);

    // Nếu có thay đổi major hoặc năm học, cần tạo lại class_code
    if (updateClassDto.major_id || updateClassDto.academic_year) {
      const majorId = updateClassDto.major_id || existingClass.major_id;
      const academicYear = updateClassDto.academic_year || existingClass.academic_year;

      const major = await this.majorRepository.findOne({
        where: { id: majorId },
        relations: ['faculty'],
      });

      if (!major) {
        throw new NotFoundException('Major not found');
      }

      const newClassCode = await this.generateClassCode(
        academicYear,
        major.code,
        major.faculty.code,
      );

      await this.classesRepository.update(id, {
        ...updateClassDto,
        class_code: newClassCode,
      });
    } else {
      await this.classesRepository.update(id, updateClassDto);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.classesRepository.remove(classEntity);
  }

  async findStudentsByFaculty(facultyId: number): Promise<Student[]> {
    return this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.classes', 'classes')
      .leftJoinAndSelect('classes.major', 'major')
      .leftJoinAndSelect('major.faculty', 'faculty')
      .where('faculty.id = :facultyId', { facultyId })
      .getMany();
  }

  async findStudentsByMajor(majorId: number): Promise<Student[]> {
    return this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.classes', 'classes')
      .leftJoinAndSelect('classes.major', 'major')
      .where('major.id = :majorId', { majorId })
      .getMany();
  }

  async findStudentsByAcademicYear(academicYear: number): Promise<Student[]> {
    return this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.classes', 'classes')
      .where('classes.academic_year = :academicYear', { academicYear })
      .getMany();
  }

  async findStudentsByClass(classId: number): Promise<Student[]> {
    return this.studentRepository.find({
      where: { classes: { id: classId } },
      relations: ['classes'],
    });
  }

  private async generateClassCode(
    academicYear: number,
    majorCode: string,
    facultyCode: string,
  ): Promise<string> {
    // Lấy 2 chữ số cuối của năm học
    const yearSuffix = academicYear.toString().slice(-2);

    // Đảm bảo mã khoa và mã ngành có đúng format (2 chữ số)
    const formattedFacultyCode = facultyCode.padStart(2, '0');
    const formattedMajorCode = majorCode.padStart(2, '0');

    // Tìm số thứ tự lớp tiếp theo trong năm học và ngành này
    const existingClasses = await this.classesRepository
      .createQueryBuilder('classes')
      .leftJoinAndSelect('classes.major', 'major')
      .where('classes.academic_year = :academicYear', { academicYear })
      .andWhere('major.code = :majorCode', { majorCode })
      .getCount();

    const nextSequence = (existingClasses + 1).toString().padStart(2, '0');

    return `${yearSuffix}${formattedFacultyCode}${formattedMajorCode}${nextSequence}`;
  }
}
