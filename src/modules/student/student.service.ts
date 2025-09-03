import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '../../entities/student.entity';
import { Classes } from '../../entities/classes.entity';
import { AcademicYear, AcademicYearStatus } from '../../entities/academic-year.entity';
import * as ExcelJS from 'exceljs';
import { Gender } from '../../shared/constants/enum';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Classes)
    private classRepository: Repository<Classes>,
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
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

  /**
   * Generate Excel template for student import with class dropdown
   * Uses ExcelJS package with proper data validation
   * Maps class_code to class.id internally for import processing
   */
  async downloadExcelTemplate(): Promise<Buffer> {
    // Lấy academic year đang active
    const activeAcademicYear = await this.academicYearRepository.findOne({
      where: { status: AcademicYearStatus.ACTIVE }
    });

    if (!activeAcademicYear) {
      throw new NotFoundException('No active academic year found');
    }

    // Lấy danh sách các lớp học trong academic year active
    const classes = await this.classRepository.find({
      where: { academic_year: activeAcademicYear.year },
      relations: ['major', 'major.faculty'],
      order: { class_code: 'ASC' }
    });

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'HƯỚNG DẪN IMPORT SINH VIÊN',
      '',
      `Năm học hiện tại: ${activeAcademicYear.year} (${activeAcademicYear.status})`,
      '',
      '1. Điền đầy đủ thông tin vào sheet "Student Template"',
      '2. Ngày sinh: định dạng YYYY-MM-DD (VD: 2000-01-15)',
      '3. Giới tính: xem sheet "Gender Options" và copy chính xác',
      '   - Chỉ được điền: Male, Female, hoặc Other',
      '4. Lớp học: xem sheet "Class Options" và copy Class Code',
      '   - VD: nếu muốn chọn lớp CS101, điền chính xác "CS101"',
      '   - Chỉ hiển thị lớp của năm học đang active',
      '5. Email phải duy nhất (không trùng lặp)',
      '6. Xóa dòng ví dụ trước khi import',
      '',
      'CÁCH SỬ DỤNG:',
      '- Xem sheet "Gender Options" để biết các giá trị giới tính hợp lệ',
      '- Xem sheet "Class Options" để biết danh sách lớp học và copy Class Code',
      '- Copy chính xác từ các sheet này vào sheet "Student Template"',
      '',
      'LƯU Ý: Tất cả các trường đều bắt buộc!'
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionSheet.addRow([instruction]);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
      } else if (instruction.startsWith('Năm học hiện tại:')) {
        row.getCell(1).font = { bold: true, size: 12, color: { argb: '008000' } };
      } else if (instruction.startsWith('LƯU Ý:')) {
        row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
      }
    });

    // ===== SHEET CHÍNH: Student Template =====
    const worksheet = workbook.addWorksheet('Student Template');

    // Thiết lập các cột với định dạng
    worksheet.columns = [
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Birth Date', key: 'birth_date', width: 15 },
      { header: 'Class', key: 'class', width: 20 },
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

    // Tạo danh sách options (không dùng data validation vì gây lỗi Excel)
    const genderOptions = ['Male', 'Female', 'Other'];
    const classOptions = classes.map(cls => cls.class_code);

    // Không thêm data validation để tránh lỗi Excel
    // Thay vào đó sẽ có sheet riêng với danh sách các option

    // Thêm dòng ví dụ
    worksheet.addRow({
      full_name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      gender: 'Male',
      birth_date: '2000-01-15',
      class: classOptions.length > 0 ? classOptions[0] : ''
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

    // ===== SHEET: Gender Options =====
    const genderSheet = workbook.addWorksheet('Gender Options');
    genderSheet.getColumn(1).width = 20;
    
    // Header
    genderSheet.getCell('A1').value = 'Available Gender Options';
    genderSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: '0066CC' } };
    
    // Add gender options
    genderOptions.forEach((gender, index) => {
      genderSheet.getCell(`A${index + 2}`).value = gender;
      genderSheet.getCell(`A${index + 2}`).font = { size: 12 };
    });

    // ===== SHEET: Class Options =====
    const classSheet = workbook.addWorksheet('Class Options');
    classSheet.columns = [
      { header: 'Class Code', key: 'class_code', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Academic Year', key: 'academic_year', width: 15 },
      { header: 'Major', key: 'major', width: 25 },
    ];

    // Style header
    const classHeaderRow = classSheet.getRow(1);
    classHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add class data
    classes.forEach(cls => {
      classSheet.addRow({
        class_code: cls.class_code,
        description: cls.description,
        academic_year: cls.academic_year,
        major: cls.major?.name || 'N/A'
      });
    });

    // ===== SHEET ẨN: Class Mapping (cho import) =====
    const hiddenSheet = workbook.addWorksheet('ClassMapping');
    hiddenSheet.state = 'hidden'; // Ẩn sheet này để import sử dụng

    hiddenSheet.columns = [
      { header: 'Class_Code', key: 'class_code', width: 20 },
      { header: 'Class_ID', key: 'class_id', width: 10 },
    ];

    // Thêm dữ liệu mapping
    classes.forEach(cls => {
      hiddenSheet.addRow({
        class_code: cls.class_code,
        class_id: cls.id
      });
    });



    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Import students from Excel file
   * Maps class_code from dropdown selection to class.id for database storage
   * Uses the existing create() method to ensure proper student code generation
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
    
    const worksheet = workbook.getWorksheet('Student Template');
    if (!worksheet) {
      throw new BadRequestException('Invalid Excel file: "Student Template" worksheet not found');
    }

    // Lấy academic year đang active
    const activeAcademicYear = await this.academicYearRepository.findOne({
      where: { status: AcademicYearStatus.ACTIVE }
    });

    if (!activeAcademicYear) {
      throw new BadRequestException('No active academic year found');
    }

    // Get classes from active academic year for mapping
    const classes = await this.classRepository.find({
      where: { academic_year: activeAcademicYear.year },
      relations: ['major', 'major.faculty'],
    });

    // Create mapping from class_code to class entity
    const classMapping = new Map<string, Classes>();
    classes.forEach(cls => {
      classMapping.set(cls.class_code, cls);
    });

    const errors: Array<{ row: number; message: string }> = [];
    const studentsToCreate: CreateStudentDto[] = [];

    // Process each row (skip header row)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      try {
        const values = row.values as any[];
        const [, fullName, email, phone, address, gender, birthDate, classDisplay] = values;

        // Skip empty rows
        if (!fullName && !email && !phone && !address && !gender && !birthDate && !classDisplay) {
          return;
        }

        // Validate required fields
        if (!fullName) {
          errors.push({ row: rowNumber, message: 'Full Name is required' });
          return;
        }

        if (!email) {
          errors.push({ row: rowNumber, message: 'Email is required' });
          return;
        }

        if (!phone) {
          errors.push({ row: rowNumber, message: 'Phone is required' });
          return;
        }

        if (!address) {
          errors.push({ row: rowNumber, message: 'Address is required' });
          return;
        }

        if (!gender) {
          errors.push({ row: rowNumber, message: 'Gender is required' });
          return;
        }

        if (!birthDate) {
          errors.push({ row: rowNumber, message: 'Birth Date is required' });
          return;
        }

        if (!classDisplay) {
          errors.push({ row: rowNumber, message: 'Class is required' });
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push({ row: rowNumber, message: 'Invalid email format' });
          return;
        }

        // Validate gender
        let genderValue: number;
        switch (gender.toLowerCase()) {
          case 'male':
            genderValue = Gender.MALE;
            break;
          case 'female':
            genderValue = Gender.FEMALE;
            break;
          case 'other':
            genderValue = Gender.OTHER;
            break;
          default:
            errors.push({ row: rowNumber, message: 'Invalid gender. Must be Male, Female, or Other' });
            return;
        }

        // Validate birth date format
        let birthDateString: string;
        if (birthDate instanceof Date) {
          birthDateString = birthDate.toISOString().split('T')[0];
        } else {
          // Try to parse various date formats
          const dateStr = birthDate.toString();
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(dateStr)) {
            errors.push({ row: rowNumber, message: 'Birth Date must be in YYYY-MM-DD format' });
            return;
          }
          birthDateString = dateStr;
        }

        // Validate class mapping
        const classEntity = classMapping.get(classDisplay.toString().trim());
        if (!classEntity) {
          errors.push({ row: rowNumber, message: `Invalid class code: ${classDisplay}. Please select from the dropdown.` });
          return;
        }

        // Create student DTO
        const createStudentDto: CreateStudentDto = {
          full_name: fullName.toString().trim(),
          email: email.toString().trim(),
          phone: phone.toString().trim(),
          address: address.toString().trim(),
          gender: genderValue,
          birth_date: birthDateString,
          class_id: classEntity.id
        };

        studentsToCreate.push(createStudentDto);

      } catch (error) {
        errors.push({ row: rowNumber, message: `Error processing row: ${error.message}` });
      }
    });

    // Check for duplicate emails within the import
    const emailSet = new Set<string>();
    
    studentsToCreate.forEach((student, index) => {
      if (emailSet.has(student.email)) {
        errors.push({ 
          row: index + 2, // +2 because we skip header and array is 0-indexed
          message: `Duplicate email in import: ${student.email}` 
        });
      } else {
        emailSet.add(student.email);
      }
    });

    // Check for existing emails in database
    if (studentsToCreate.length > 0) {
      const emails = studentsToCreate.map(s => s.email);
      const existingStudents = await this.studentRepository.find({
        where: emails.map(email => ({ email })),
        select: ['email']
      });
      
      const existingEmails = new Set(existingStudents.map(s => s.email));
      studentsToCreate.forEach((student, index) => {
        if (existingEmails.has(student.email)) {
          errors.push({ 
            row: index + 2,
            message: `Email already exists in database: ${student.email}` 
          });
        }
      });
    }

    // Filter out students with errors
    const validStudents = studentsToCreate.filter((_, index) => 
      !errors.some(error => error.row === index + 2)
    );

    // Create students one by one using existing create logic
    let successCount = 0;
    if (validStudents.length > 0) {
      for (const studentDto of validStudents) {
        try {
          await this.create(studentDto);
          successCount++;
        } catch (error) {
          errors.push({ 
            row: studentsToCreate.indexOf(studentDto) + 2,
            message: `Failed to create student: ${error.message}` 
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
   * Generate Excel file with 100 sample students
   * Uses active academic year and existing classes
   */
  async downloadExcelWithSampleData(): Promise<Buffer> {
    // Lấy academic year đang active
    const activeAcademicYear = await this.academicYearRepository.findOne({
      where: { status: AcademicYearStatus.ACTIVE }
    });

    if (!activeAcademicYear) {
      throw new NotFoundException('No active academic year found');
    }

    // Lấy danh sách các lớp học trong academic year active
    const classes = await this.classRepository.find({
      where: { academic_year: activeAcademicYear.year },
      relations: ['major', 'major.faculty'],
      order: { class_code: 'ASC' }
    });

    if (classes.length === 0) {
      throw new NotFoundException('No classes found in active academic year');
    }

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'FILE DỮ LIỆU MẪU - 100 SINH VIÊN',
      '',
      `Năm học hiện tại: ${activeAcademicYear.year} (${activeAcademicYear.status})`,
      '',
      'File này chứa 100 sinh viên mẫu để bạn tham khảo định dạng dữ liệu.',
      '',
      'CẤU TRÚC DỮ LIỆU:',
      '- Full Name: Họ tên đầy đủ',
      '- Email: Địa chỉ email duy nhất',
      '- Phone: Số điện thoại (10-11 số)',
      '- Address: Địa chỉ chi tiết',
      '- Gender: Male, Female, hoặc Other',
      '- Birth Date: Định dạng YYYY-MM-DD',
      '- Class: Mã lớp từ danh sách có sẵn',
      '',
      'LƯU Ý:',
      '- Dữ liệu này chỉ để tham khảo',
      '- Có thể sửa đổi và import vào hệ thống',
      '- Đảm bảo email không trùng lặp khi import thật'
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionSheet.addRow([instruction]);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
      } else if (instruction.startsWith('Năm học hiện tại:')) {
        row.getCell(1).font = { bold: true, size: 12, color: { argb: '008000' } };
      } else if (instruction.startsWith('CẤU TRÚC DỮ LIỆU:') || instruction.startsWith('LƯU Ý:')) {
        row.getCell(1).font = { bold: true, color: { argb: 'FF8C00' } };
      }
    });

    // ===== SHEET CHÍNH: Sample Data =====
    const worksheet = workbook.addWorksheet('Sample Data');

    // Thiết lập các cột
    worksheet.columns = [
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Birth Date', key: 'birth_date', width: 15 },
      { header: 'Class', key: 'class', width: 20 },
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

    // Tạo dữ liệu mẫu 100 sinh viên
    const genderOptions = ['Male', 'Female', 'Other'];
    const classOptions = classes.map(cls => cls.class_code);
    
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
    const middleNames = ['Văn', 'Thị', 'Minh', 'Hoàng', 'Thanh', 'Quang', 'Hữu', 'Đình', 'Xuân', 'Thu'];
    const firstNames = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Giang', 'Hà', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phong', 'Quân', 'Sơn', 'Trang', 'Uyên', 'Vinh', 'Yến'];
    
    const streetPrefixes = ['Đường', 'Phố', 'Ngõ'];
    const streetNames = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Quang Trung', 'Lạc Long Quân', 'Âu Cơ', 'Điện Biên Phủ', 'Cộng Hòa'];
    const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận Tân Bình', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Thủ Đức', 'Quận 7'];
    const cities = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

    for (let i = 1; i <= 100; i++) {
      // Tạo tên ngẫu nhiên
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const fullName = `${lastName} ${middleName} ${firstName}`;

      // Tạo email duy nhất
      const emailPrefix = `${lastName.toLowerCase()}${middleName.toLowerCase()}${firstName.toLowerCase()}${String(i).padStart(3, '0')}`;
      const email = `${emailPrefix}@student.university.edu.vn`;

      // Tạo số điện thoại
      const phone = `09${Math.floor(Math.random() * 90000000) + 10000000}`;

      // Tạo địa chỉ
      const streetNumber = Math.floor(Math.random() * 999) + 1;
      const streetPrefix = streetPrefixes[Math.floor(Math.random() * streetPrefixes.length)];
      const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
      const district = districts[Math.floor(Math.random() * districts.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const address = `${streetNumber} ${streetPrefix} ${streetName}, ${district}, ${city}`;

      // Tạo giới tính
      const gender = genderOptions[Math.floor(Math.random() * genderOptions.length)];

      // Tạo ngày sinh (từ 1995 đến 2005)
      const year = Math.floor(Math.random() * 11) + 1995;
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Chọn lớp ngẫu nhiên
      const classCode = classOptions[Math.floor(Math.random() * classOptions.length)];

      // Thêm dữ liệu vào worksheet
      const row = worksheet.addRow({
        full_name: fullName,
        email: email,
        phone: phone,
        address: address,
        gender: gender,
        birth_date: birthDate,
        class: classCode
      });

      // Style cho các dòng dữ liệu
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'D3D3D3' } },
          left: { style: 'thin', color: { argb: 'D3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'D3D3D3' } },
          right: { style: 'thin', color: { argb: 'D3D3D3' } }
        };
      });

      // Highlight mỗi 10 dòng với màu khác
      if (i % 10 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F0F8FF' }
          };
        });
      }
    }

    // ===== SHEET: Gender Options =====
    const genderSheet = workbook.addWorksheet('Gender Options');
    genderSheet.getColumn(1).width = 20;
    
    genderSheet.getCell('A1').value = 'Available Gender Options';
    genderSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: '0066CC' } };
    
    genderOptions.forEach((gender, index) => {
      genderSheet.getCell(`A${index + 2}`).value = gender;
      genderSheet.getCell(`A${index + 2}`).font = { size: 12 };
    });

    // ===== SHEET: Class Options =====
    const classSheet = workbook.addWorksheet('Class Options');
    classSheet.columns = [
      { header: 'Class Code', key: 'class_code', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Academic Year', key: 'academic_year', width: 15 },
      { header: 'Major', key: 'major', width: 25 },
    ];

    // Style header
    const classHeaderRow = classSheet.getRow(1);
    classHeaderRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4472C4' }
      };
    });

    // Add class data
    classes.forEach(cls => {
      classSheet.addRow({
        class_code: cls.class_code,
        description: cls.description,
        academic_year: cls.academic_year,
        major: cls.major?.name || 'N/A'
      });
    });

    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}