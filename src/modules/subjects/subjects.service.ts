import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { Faculty } from '../../entities/faculty.entity';
import { GradingFormula } from '../../entities/grading-formula.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SUBJECT_ERROR_MESSAGES } from './constants/error-messages';
import { GradingFormulasService } from '../grading-formulas/grading-formulas.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepository: Repository<Subject>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
    @InjectRepository(GradingFormula)
    private gradingFormulaRepository: Repository<GradingFormula>,
    private gradingFormulasService: GradingFormulasService,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      // Verify grading formula exists
      await this.gradingFormulasService.findOne(createSubjectDto.gradingFormulaId);

      // Check if subject with same name exists
      const existingSubject = await this.subjectRepository.findOne({
        where: { name: createSubjectDto.name },
      });

      if (existingSubject) {
        throw new ConflictException(SUBJECT_ERROR_MESSAGES.ALREADY_EXISTS);
      }

      const subject = this.subjectRepository.create(createSubjectDto);
      return await this.subjectRepository.save(subject);
    } catch (error) {
      console.log(error);
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(SUBJECT_ERROR_MESSAGES.GRADING_FORMULA_NOT_FOUND);
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  async findAll(): Promise<Subject[]> {
    try {
      return await this.subjectRepository.find({
        relations: ['gradingFormula'],
        order: {
          created_at: 'DESC',
        },
      });
    } catch (error) {
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.NOT_FOUND);
    }
  }

  async findOne(id: number): Promise<Subject> {
    try {
      const subject = await this.subjectRepository.findOne({
        where: { id },
        relations: ['gradingFormula'],
      });

      if (!subject) {
        throw new NotFoundException(SUBJECT_ERROR_MESSAGES.NOT_FOUND);
      }

      return subject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.INVALID_ID);
    }
  }

  async update(id: number, updateSubjectDto: CreateSubjectDto): Promise<Subject> {
    try {
      const subject = await this.findOne(id);

      // Verify grading formula exists
      await this.gradingFormulasService.findOne(updateSubjectDto.gradingFormulaId);

      // Check if new name conflicts with existing subject
      if (updateSubjectDto.name !== subject.name) {
        const existingSubject = await this.subjectRepository.findOne({
          where: { name: updateSubjectDto.name },
        });

        if (existingSubject) {
          throw new ConflictException(SUBJECT_ERROR_MESSAGES.ALREADY_EXISTS);
        }
      }

      Object.assign(subject, updateSubjectDto);
      return await this.subjectRepository.save(subject);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.subjectRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(SUBJECT_ERROR_MESSAGES.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(SUBJECT_ERROR_MESSAGES.DELETE_FAILED);
    }
  }

  /**
   * Generate Excel template for subject import
   */
  async downloadExcelTemplate(): Promise<Buffer> {
    // Lấy danh sách tất cả các khoa và công thức tính điểm
    const [faculties, gradingFormulas] = await Promise.all([
      this.facultyRepository.find({ order: { name: 'ASC' } }),
      this.gradingFormulaRepository.find({ order: { name: 'ASC' } })
    ]);

    if (faculties.length === 0) {
      throw new NotFoundException('No faculties found. Please create at least one faculty first.');
    }

    if (gradingFormulas.length === 0) {
      throw new NotFoundException('No grading formulas found. Please create at least one grading formula first.');
    }

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'HƯỚNG DẪN IMPORT MÔN HỌC',
      '',
      '1. Điền đầy đủ thông tin vào sheet "Subject Template"',
      '2. Name: Tên môn học (VD: Lập trình Web)',
      '3. Credits: Số tín chỉ (1-20)',
      '4. Description: Mô tả về môn học (có thể để trống)',
      '5. Faculty: Chọn khoa từ danh sách trong sheet "Faculty Options"',
      '   - Copy chính xác tên khoa từ sheet "Faculty Options"',
      '6. Grading Formula: Chọn công thức tính điểm từ sheet "Grading Formula Options"',
      '   - Copy chính xác tên công thức từ sheet "Grading Formula Options"',
      '7. Xóa dòng ví dụ trước khi import',
      '',
      'LƯU Ý:',
      '- Name, Credits, Faculty và Grading Formula là bắt buộc',
      '- Name phải duy nhất trong hệ thống',
      '- Credits phải từ 1-20',
      '- Description có thể để trống',
      '- Faculty và Grading Formula phải tồn tại trong hệ thống'
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionSheet.addRow([instruction]);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
      } else if (instruction.startsWith('LƯU Ý:')) {
        row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
      }
    });

    // ===== SHEET CHÍNH: Subject Template =====
    const worksheet = workbook.addWorksheet('Subject Template');

    // Thiết lập các cột với định dạng
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Credits', key: 'credits', width: 10 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Faculty', key: 'faculty', width: 40 },
      { header: 'Grading Formula', key: 'grading_formula', width: 40 },
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
      name: 'Lập trình Web',
      credits: 3,
      description: 'Môn học về phát triển ứng dụng web với các công nghệ hiện đại',
      faculty: faculties[0].name,
      grading_formula: gradingFormulas[0].name
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

    // ===== SHEET: Faculty Options =====
    const facultySheet = workbook.addWorksheet('Faculty Options');
    facultySheet.columns = [
      { header: 'Faculty Name', key: 'faculty_name', width: 40 },
      { header: 'Faculty Code', key: 'faculty_code', width: 15 },
      { header: 'Dean', key: 'dean', width: 30 },
    ];

    // Style header
    const facultyHeaderRow = facultySheet.getRow(1);
    facultyHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add faculty data
    faculties.forEach(faculty => {
      facultySheet.addRow({
        faculty_name: faculty.name,
        faculty_code: faculty.code,
        dean: faculty.dean || 'N/A'
      });
    });

    // ===== SHEET: Grading Formula Options =====
    const gradingFormulaSheet = workbook.addWorksheet('Grading Formula Options');
    gradingFormulaSheet.columns = [
      { header: 'Formula Name', key: 'formula_name', width: 40 },
      { header: 'Description', key: 'description', width: 50 },
    ];

    // Style header
    const formulaHeaderRow = gradingFormulaSheet.getRow(1);
    formulaHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add grading formula data
    gradingFormulas.forEach(formula => {
      gradingFormulaSheet.addRow({
        formula_name: formula.name,
        description: formula.description || 'N/A'
      });
    });

    // ===== SHEET ẨN: Mapping =====
    const hiddenSheet = workbook.addWorksheet('Mapping');
    hiddenSheet.state = 'hidden';

    hiddenSheet.columns = [
      { header: 'Faculty_Name', key: 'faculty_name', width: 40 },
      { header: 'Faculty_ID', key: 'faculty_id', width: 10 },
      { header: 'Formula_Name', key: 'formula_name', width: 40 },
      { header: 'Formula_ID', key: 'formula_id', width: 10 },
    ];

    // Thêm dữ liệu mapping
    faculties.forEach(faculty => {
      hiddenSheet.addRow({
        faculty_name: faculty.name,
        faculty_id: faculty.id,
        formula_name: null,
        formula_id: null
      });
    });

    gradingFormulas.forEach(formula => {
      hiddenSheet.addRow({
        faculty_name: null,
        faculty_id: null,
        formula_name: formula.name,
        formula_id: formula.id
      });
    });

    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Import subjects from Excel file
   */
  async importFromExcel(file: Express.Multer.File): Promise<{ 
    success: number; 
    errors: Array<{ row: number; message: string }> 
  }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    const worksheet = workbook.getWorksheet('Subject Template');
    if (!worksheet) {
      throw new BadRequestException('Invalid Excel file: "Subject Template" worksheet not found');
    }

    // Get all faculties and grading formulas for mapping
    const [faculties, gradingFormulas] = await Promise.all([
      this.facultyRepository.find(),
      this.gradingFormulaRepository.find()
    ]);

    // Create mappings
    const facultyMapping = new Map<string, Faculty>();
    const formulaMapping = new Map<string, GradingFormula>();

    faculties.forEach(faculty => {
      facultyMapping.set(faculty.name, faculty);
    });

    gradingFormulas.forEach(formula => {
      formulaMapping.set(formula.name, formula);
    });

    const errors: Array<{ row: number; message: string }> = [];
    const subjectsToCreate: CreateSubjectDto[] = [];

    // Process each row (skip header row)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      try {
        const values = row.values as any[];
        const [, name, credits, description, facultyName, formulaName] = values;

        // Skip empty rows
        if (!name && !credits && !description && !facultyName && !formulaName) {
          return;
        }

        // Validate required fields
        if (!name) {
          errors.push({ row: rowNumber, message: 'Name is required' });
          return;
        }

        if (!credits) {
          errors.push({ row: rowNumber, message: 'Credits is required' });
          return;
        }

        // Validate credits range
        const creditsNum = Number(credits);
        if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 20) {
          errors.push({ row: rowNumber, message: 'Credits must be a number between 1 and 20' });
          return;
        }

        if (!facultyName) {
          errors.push({ row: rowNumber, message: 'Faculty is required' });
          return;
        }

        if (!formulaName) {
          errors.push({ row: rowNumber, message: 'Grading Formula is required' });
          return;
        }

        // Validate faculty mapping
        const facultyEntity = facultyMapping.get(facultyName.toString().trim());
        if (!facultyEntity) {
          errors.push({ row: rowNumber, message: `Invalid faculty name: ${facultyName}. Please select from the faculty list.` });
          return;
        }

        // Validate grading formula mapping
        const formulaEntity = formulaMapping.get(formulaName.toString().trim());
        if (!formulaEntity) {
          errors.push({ row: rowNumber, message: `Invalid grading formula name: ${formulaName}. Please select from the grading formula list.` });
          return;
        }

        // Create subject DTO
        const createSubjectDto: CreateSubjectDto = {
          name: name.toString().trim(),
          credits: creditsNum,
          description: description ? description.toString().trim() : undefined,
          faculty_id: facultyEntity.id,
          gradingFormulaId: formulaEntity.id
        };

        subjectsToCreate.push(createSubjectDto);

      } catch (error) {
        errors.push({ row: rowNumber, message: `Error processing row: ${error.message}` });
      }
    });

    // Check for duplicate names within the import
    const nameSet = new Set<string>();
    
    subjectsToCreate.forEach((subject, index) => {
      if (nameSet.has(subject.name)) {
        errors.push({ 
          row: index + 2,
          message: `Duplicate name in import: ${subject.name}` 
        });
      } else {
        nameSet.add(subject.name);
      }
    });

    // Check for existing names in database
    if (subjectsToCreate.length > 0) {
      const names = subjectsToCreate.map(s => s.name);
      
      const existingSubjects = await this.subjectRepository.find({
        where: names.map(name => ({ name })),
        select: ['name']
      });
      
      const existingNames = new Set(existingSubjects.map(s => s.name));
      
      subjectsToCreate.forEach((subject, index) => {
        if (existingNames.has(subject.name)) {
          errors.push({ 
            row: index + 2,
            message: `Subject name already exists: ${subject.name}` 
          });
        }
      });
    }

    // Filter out subjects with errors
    const validSubjects = subjectsToCreate.filter((_, index) => 
      !errors.some(error => error.row === index + 2)
    );

    // Create subjects one by one using existing create logic
    let successCount = 0;
    if (validSubjects.length > 0) {
      for (const subjectDto of validSubjects) {
        try {
          await this.create(subjectDto);
          successCount++;
        } catch (error) {
          errors.push({ 
            row: subjectsToCreate.indexOf(subjectDto) + 2,
            message: `Failed to create subject: ${error.message}` 
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
   * Generate Excel file with sample subjects
   */
  async downloadExcelWithSampleData(): Promise<Buffer> {
    // Lấy danh sách tất cả các khoa và công thức tính điểm
    const [faculties, gradingFormulas] = await Promise.all([
      this.facultyRepository.find({ order: { name: 'ASC' } }),
      this.gradingFormulaRepository.find({ order: { name: 'ASC' } })
    ]);

    if (faculties.length === 0) {
      throw new NotFoundException('No faculties found. Please create at least one faculty first.');
    }

    if (gradingFormulas.length === 0) {
      throw new NotFoundException('No grading formulas found. Please create at least one grading formula first.');
    }

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'HƯỚNG DẪN IMPORT MÔN HỌC',
      '',
      '1. Điền đầy đủ thông tin vào sheet "Subject Template"',
      '2. Name: Tên môn học (VD: Lập trình Web)',
      '3. Credits: Số tín chỉ (1-20)',
      '4. Description: Mô tả về môn học (có thể để trống)',
      '5. Faculty: Chọn khoa từ danh sách trong sheet "Faculty Options"',
      '   - Copy chính xác tên khoa từ sheet "Faculty Options"',
      '6. Grading Formula: Chọn công thức tính điểm từ sheet "Grading Formula Options"',
      '   - Copy chính xác tên công thức từ sheet "Grading Formula Options"',
      '7. Xóa dòng ví dụ trước khi import',
      '',
      'LƯU Ý:',
      '- Name, Credits, Faculty và Grading Formula là bắt buộc',
      '- Name phải duy nhất trong hệ thống',
      '- Credits phải từ 1-20',
      '- Description có thể để trống',
      '- Faculty và Grading Formula phải tồn tại trong hệ thống'
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
    const worksheet = workbook.addWorksheet('Subject Template');

    // Thiết lập các cột
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Credits', key: 'credits', width: 10 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Faculty', key: 'faculty', width: 40 },
      { header: 'Grading Formula', key: 'grading_formula', width: 40 },
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

    // Tạo dữ liệu mẫu cho từng khoa
    const sampleSubjects = [];
    faculties.forEach(faculty => {
      switch (faculty.code) {
        case 'CNTT':
          sampleSubjects.push(
            { name: 'Lập trình Web', credits: 3, description: 'Phát triển ứng dụng web với các công nghệ hiện đại', faculty: faculty.name },
            { name: 'Cơ sở dữ liệu', credits: 4, description: 'Thiết kế và quản lý cơ sở dữ liệu', faculty: faculty.name },
            { name: 'Lập trình Java', credits: 4, description: 'Lập trình hướng đối tượng với Java', faculty: faculty.name }
          );
          break;
        case 'KT':
          sampleSubjects.push(
            { name: 'Kinh tế vĩ mô', credits: 3, description: 'Nghiên cứu các vấn đề kinh tế ở tầm vĩ mô', faculty: faculty.name },
            { name: 'Marketing căn bản', credits: 3, description: 'Các nguyên lý cơ bản của marketing', faculty: faculty.name }
          );
          break;
        case 'DDT':
          sampleSubjects.push(
            { name: 'Mạch điện tử', credits: 4, description: 'Thiết kế và phân tích mạch điện tử', faculty: faculty.name },
            { name: 'Kỹ thuật số', credits: 3, description: 'Cơ sở của hệ thống số', faculty: faculty.name }
          );
          break;
        default:
          sampleSubjects.push(
            { name: `${faculty.name} - Môn cơ sở 1`, credits: 3, description: `Môn học cơ sở 1 của ${faculty.name}`, faculty: faculty.name },
            { name: `${faculty.name} - Môn cơ sở 2`, credits: 3, description: `Môn học cơ sở 2 của ${faculty.name}`, faculty: faculty.name }
          );
      }
    });

    // Thêm công thức tính điểm ngẫu nhiên cho mỗi môn
    sampleSubjects.forEach((subject, index) => {
      subject.grading_formula = gradingFormulas[index % gradingFormulas.length].name;
    });

    // Thêm dữ liệu vào worksheet
    sampleSubjects.forEach((subject, index) => {
      const row = worksheet.addRow(subject);

      // Style cho các dòng dữ liệu
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'D3D3D3' } },
          left: { style: 'thin', color: { argb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
          right: { style: 'thin', color: { argb: 'D3D3D3' } }
        };
      });

      // Highlight mỗi 3 dòng với màu khác
      if ((index + 1) % 3 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F8FF' }
          };
        });
      }
    });

    // ===== SHEET: Faculty Options =====
    const facultySheet = workbook.addWorksheet('Faculty Options');
    facultySheet.columns = [
      { header: 'Faculty Name', key: 'faculty_name', width: 40 },
      { header: 'Faculty Code', key: 'faculty_code', width: 15 },
      { header: 'Dean', key: 'dean', width: 30 },
    ];

    // Style header
    const facultyHeaderRow = facultySheet.getRow(1);
    facultyHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add faculty data
    faculties.forEach(faculty => {
      facultySheet.addRow({
        faculty_name: faculty.name,
        faculty_code: faculty.code,
        dean: faculty.dean || 'N/A'
      });
    });

    // ===== SHEET: Grading Formula Options =====
    const gradingFormulaSheet = workbook.addWorksheet('Grading Formula Options');
    gradingFormulaSheet.columns = [
      { header: 'Formula Name', key: 'formula_name', width: 40 },
      { header: 'Description', key: 'description', width: 50 },
    ];

    // Style header
    const formulaHeaderRow = gradingFormulaSheet.getRow(1);
    formulaHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add grading formula data
    gradingFormulas.forEach(formula => {
      gradingFormulaSheet.addRow({
        formula_name: formula.name,
        description: formula.description || 'N/A'
      });
    });

    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
} 