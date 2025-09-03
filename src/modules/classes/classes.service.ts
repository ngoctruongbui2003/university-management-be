import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classes } from '../../entities/classes.entity';
import { Major } from '../../entities/major.entity';
import { Student } from '../../entities/student.entity';
import { AcademicYear, AcademicYearStatus } from '../../entities/academic-year.entity';
import { CreateClassDto, UpdateClassDto } from './dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes)
    private readonly classesRepository: Repository<Classes>,
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
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

  /**
   * Get active academic year
   */
  private async getActiveAcademicYear(): Promise<AcademicYear> {
    const activeYear = await this.academicYearRepository.findOne({
      where: { status: AcademicYearStatus.ACTIVE },
      order: { year: 'DESC' }
    });

    if (!activeYear) {
      throw new NotFoundException('No active academic year found');
    }

    return activeYear;
  }

  /**
   * Generate Excel template for class import
   */
  async downloadExcelTemplate(): Promise<Buffer> {
    // Lấy năm học đang active
    const activeYear = await this.getActiveAcademicYear();

    // Lấy danh sách tất cả các ngành
    const majors = await this.majorRepository.find({
      relations: ['faculty'],
      order: { name: 'ASC' }
    });

    if (majors.length === 0) {
      throw new NotFoundException('No majors found. Please create at least one major first.');
    }

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'HƯỚNG DẪN IMPORT LỚP HỌC',
      '',
      '1. Điền đầy đủ thông tin vào sheet "Class Template"',
      '2. Description: Mô tả về lớp học',
      '3. Major: Chọn ngành từ danh sách trong sheet "Major Options"',
      '   - Copy chính xác tên ngành từ sheet "Major Options"',
      '4. Xóa dòng ví dụ trước khi import',
      '',
      'LƯU Ý:',
      '- Description và Major là bắt buộc',
      `- Năm học sẽ tự động là ${activeYear.year} (năm học đang active)`,
      '- Class Code sẽ được tự động tạo theo quy tắc',
      '- Major phải tồn tại trong hệ thống'
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionSheet.addRow([instruction]);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
      } else if (instruction.startsWith('LƯU Ý:')) {
        row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
      }
    });

    // ===== SHEET CHÍNH: Class Template =====
    const worksheet = workbook.addWorksheet('Class Template');

    // Thiết lập các cột với định dạng
    worksheet.columns = [
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Major', key: 'major', width: 40 },
    ];

    // Style cho header
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Thêm dòng ví dụ
    worksheet.addRow({
      description: 'Lớp Công nghệ Thông tin K23',
      major: majors[0].name
    });

    // Style cho dòng ví dụ
    const sampleRow = worksheet.getRow(2);
    sampleRow.eachCell((cell) => {
      cell.font = { italic: true, color: { argb: '808080' } };
      cell.border = {
        top: { style: 'thin', color: { argb: 'D3D3D3' } },
        left: { style: 'thin', color: { argb: 'D3D3D3' } },
        bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
        right: { style: 'thin', color: { argb: 'D3D3D3' } }
      };
    });

    // ===== SHEET: Major Options =====
    const majorSheet = workbook.addWorksheet('Major Options');
    majorSheet.columns = [
      { header: 'Major Name', key: 'major_name', width: 40 },
      { header: 'Major Code', key: 'major_code', width: 15 },
      { header: 'Faculty', key: 'faculty_name', width: 40 },
    ];

    // Style header
    const majorHeaderRow = majorSheet.getRow(1);
    majorHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add major data
    majors.forEach(major => {
      majorSheet.addRow({
        major_name: major.name,
        major_code: major.code,
        faculty_name: major.faculty.name
      });
    });

    // ===== SHEET ẨN: Mapping =====
    const hiddenSheet = workbook.addWorksheet('Mapping');
    hiddenSheet.state = 'hidden';

    hiddenSheet.columns = [
      { header: 'Major_Name', key: 'major_name', width: 40 },
      { header: 'Major_ID', key: 'major_id', width: 10 },
    ];

    // Thêm dữ liệu mapping
    majors.forEach(major => {
      hiddenSheet.addRow({
        major_name: major.name,
        major_id: major.id
      });
    });

    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Import classes from Excel file
   */
  async importFromExcel(file: Express.Multer.File): Promise<{ 
    success: number; 
    errors: Array<{ row: number; message: string }> 
  }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Lấy năm học đang active
    const activeYear = await this.getActiveAcademicYear();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    const worksheet = workbook.getWorksheet('Class Template');
    if (!worksheet) {
      throw new BadRequestException('Invalid Excel file: "Class Template" worksheet not found');
    }

    // Get all majors for mapping
    const majors = await this.majorRepository.find({
      relations: ['faculty']
    });

    // Create mapping from major name to major entity
    const majorMapping = new Map<string, Major>();
    majors.forEach(major => {
      majorMapping.set(major.name, major);
    });

    const errors: Array<{ row: number; message: string }> = [];
    const classesToCreate: CreateClassDto[] = [];

    // Process each row (skip header row)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      try {
        const values = row.values as any[];
        const [, description, majorName] = values;

        // Skip empty rows
        if (!description && !majorName) {
          return;
        }

        // Validate required fields
        if (!description) {
          errors.push({ row: rowNumber, message: 'Description is required' });
          return;
        }

        if (!majorName) {
          errors.push({ row: rowNumber, message: 'Major is required' });
          return;
        }

        // Validate major mapping
        const majorEntity = majorMapping.get(majorName.toString().trim());
        if (!majorEntity) {
          errors.push({ row: rowNumber, message: `Invalid major name: ${majorName}. Please select from the major list.` });
          return;
        }

        // Create class DTO
        const createClassDto: CreateClassDto = {
          description: description.toString().trim(),
          major_id: majorEntity.id,
          academic_year: activeYear.year
        };

        classesToCreate.push(createClassDto);

      } catch (error) {
        errors.push({ row: rowNumber, message: `Error processing row: ${error.message}` });
      }
    });

    // Create classes one by one using existing create logic
    let successCount = 0;
    if (classesToCreate.length > 0) {
      for (const classDto of classesToCreate) {
        try {
          await this.create(classDto);
          successCount++;
        } catch (error) {
          errors.push({ 
            row: classesToCreate.indexOf(classDto) + 2,
            message: `Failed to create class: ${error.message}` 
          });
        }
      }
    }

    return {
      success: successCount,
      errors: errors
    };
  }

  /**
   * Generate Excel file with sample classes
   */
  async downloadExcelWithSampleData(): Promise<Buffer> {
    // Lấy năm học đang active
    const activeYear = await this.getActiveAcademicYear();

    // Lấy danh sách tất cả các ngành
    const majors = await this.majorRepository.find({
      relations: ['faculty'],
      order: { name: 'ASC' }
    });

    if (majors.length === 0) {
      throw new NotFoundException('No majors found. Please create at least one major first.');
    }

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'HƯỚNG DẪN IMPORT LỚP HỌC',
      '',
      '1. Điền đầy đủ thông tin vào sheet "Class Template"',
      '2. Description: Mô tả về lớp học',
      '3. Major: Chọn ngành từ danh sách trong sheet "Major Options"',
      '   - Copy chính xác tên ngành từ sheet "Major Options"',
      '4. Xóa dòng ví dụ trước khi import',
      '',
      'LƯU Ý:',
      '- Description và Major là bắt buộc',
      `- Năm học sẽ tự động là ${activeYear.year} (năm học đang active)`,
      '- Class Code sẽ được tự động tạo theo quy tắc',
      '- Major phải tồn tại trong hệ thống'
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionSheet.addRow([instruction]);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
      } else if (instruction.startsWith('CẤU TRÚC DỮ LIỆU:') || instruction.startsWith('LƯU Ý:')) {
        row.getCell(1).font = { bold: true, color: { argb: 'FF8C00' } };
      }
    });

    // ===== SHEET CHÍNH: Sample Data =====
    const worksheet = workbook.addWorksheet('Class Template');

    // Thiết lập các cột
    worksheet.columns = [
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Major', key: 'major', width: 40 },
    ];

    // Style cho header
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Tạo dữ liệu mẫu cho từng ngành
    const sampleClasses = [];
    majors.forEach(major => {
      // Tạo 2 lớp mẫu cho mỗi ngành
      sampleClasses.push(
        { description: `${major.name} - Lớp 1 - K${activeYear.year.toString().slice(-2)}`, major: major.name },
        { description: `${major.name} - Lớp 2 - K${activeYear.year.toString().slice(-2)}`, major: major.name }
      );
    });

    // Thêm dữ liệu vào worksheet
    sampleClasses.forEach((classData, index) => {
      const row = worksheet.addRow(classData);

      // Style cho các dòng dữ liệu
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'D3D3D3' } },
          left: { style: 'thin', color: { argb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
          right: { style: 'thin', color: { argb: 'D3D3D3' } }
        };
      });

      // Highlight mỗi 2 dòng với màu khác (mỗi ngành)
      if ((index + 1) % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F8FF' }
          };
        });
      }
    });

    // ===== SHEET: Major Options =====
    const majorSheet = workbook.addWorksheet('Major Options');
    majorSheet.columns = [
      { header: 'Major Name', key: 'major_name', width: 40 },
      { header: 'Major Code', key: 'major_code', width: 15 },
      { header: 'Faculty', key: 'faculty_name', width: 40 },
    ];

    // Style header
    const majorHeaderRow = majorSheet.getRow(1);
    majorHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add major data
    majors.forEach(major => {
      majorSheet.addRow({
        major_name: major.name,
        major_code: major.code,
        faculty_name: major.faculty.name
      });
    });

    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
