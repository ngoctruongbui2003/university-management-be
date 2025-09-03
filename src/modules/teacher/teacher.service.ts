import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from '../../entities/teacher.entity';
import { Faculty } from '../../entities/faculty.entity';
import * as ExcelJS from 'exceljs';
import { Gender } from '../../shared/constants/enum';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(Faculty)
    private facultyRepository: Repository<Faculty>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teacherRepository.create(createTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async findAll(): Promise<Teacher[]> {
    return await this.teacherRepository.find({
      relations: ['faculty'],
    });
  }

  async findOne(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['faculty'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${id} not found`);
    }

    return teacher;
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const teacher = await this.findOne(id);
    Object.assign(teacher, updateTeacherDto);
    return await this.teacherRepository.save(teacher);
  }

  async remove(id: number): Promise<void> {
    const teacher = await this.findOne(id);
    await this.teacherRepository.remove(teacher);
  }

  /**
   * Generate Excel template for teacher import with faculty dropdown
   */
  async downloadExcelTemplate(): Promise<Buffer> {
    // Lấy danh sách tất cả các khoa
    const faculties = await this.facultyRepository.find({
      order: { name: 'ASC' }
    });

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'HƯỚNG DẪN IMPORT GIẢNG VIÊN',
      '',
      '1. Điền đầy đủ thông tin vào sheet "Teacher Template"',
      '2. Ngày sinh: định dạng YYYY-MM-DD (VD: 1980-05-15)',
      '3. Giới tính: xem sheet "Gender Options" và copy chính xác',
      '   - Chỉ được điền: Male, Female, hoặc Other',
      '4. Khoa: xem sheet "Faculty Options" và copy Faculty Name',
      '   - VD: nếu muốn chọn khoa "Công nghệ thông tin", điền chính xác tên khoa',
      '5. Qualification: Trình độ học vấn (VD: Thạc sĩ, Tiến sĩ, ...)',
      '6. Department: Bộ môn trong khoa',
      '7. Email phải duy nhất (không trùng lặp)',
      '8. Xóa dòng ví dụ trước khi import',
      '',
      'CÁCH SỬ DỤNG:',
      '- Xem sheet "Gender Options" để biết các giá trị giới tính hợp lệ',
      '- Xem sheet "Faculty Options" để biết danh sách khoa và copy Faculty Name',
      '- Copy chính xác từ các sheet này vào sheet "Teacher Template"',
      '',
      'LƯU Ý: Tất cả các trường đều bắt buộc!'
    ];

    instructions.forEach((instruction, index) => {
      const row = instructionSheet.addRow([instruction]);
      if (index === 0) {
        row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
      } else if (instruction.startsWith('LƯU Ý:')) {
        row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
      } else if (instruction.startsWith('CÁCH SỬ DỤNG:')) {
        row.getCell(1).font = { bold: true, color: { argb: 'FF8C00' } };
      }
    });

    // ===== SHEET CHÍNH: Teacher Template =====
    const worksheet = workbook.addWorksheet('Teacher Template');

    // Thiết lập các cột với định dạng
    worksheet.columns = [
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Birth Date', key: 'birth_date', width: 15 },
      { header: 'Qualification', key: 'qualification', width: 20 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Faculty', key: 'faculty', width: 25 },
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

    // Tạo danh sách options (không dùng data validation để tránh lỗi Excel)
    const genderOptions = ['Male', 'Female', 'Other'];
    const facultyOptions = faculties.map(faculty => faculty.name);

    // Thêm dòng ví dụ
    worksheet.addRow({
      full_name: 'TS. Nguyễn Văn An',
      email: 'nguyenvanan@university.edu.vn',
      phone: '0901234567',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      gender: 'Male',
      birth_date: '1980-05-15',
      qualification: 'Tiến sĩ',
      department: 'Khoa học máy tính',
      faculty: facultyOptions.length > 0 ? facultyOptions[0] : ''
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
    
    genderSheet.getCell('A1').value = 'Available Gender Options';
    genderSheet.getCell('A1').font = { bold: true, size: 14, color: { argb: '0066CC' } };
    
    genderOptions.forEach((gender, index) => {
      genderSheet.getCell(`A${index + 2}`).value = gender;
      genderSheet.getCell(`A${index + 2}`).font = { size: 12 };
    });

    // ===== SHEET: Faculty Options =====
    const facultySheet = workbook.addWorksheet('Faculty Options');
    facultySheet.columns = [
      { header: 'Faculty Name', key: 'faculty_name', width: 30 },
      { header: 'Faculty Code', key: 'faculty_code', width: 15 },
      { header: 'Dean', key: 'dean', width: 25 },
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

    // ===== SHEET ẨN: Faculty Mapping (cho import) =====
    const hiddenSheet = workbook.addWorksheet('FacultyMapping');
    hiddenSheet.state = 'hidden';

    hiddenSheet.columns = [
      { header: 'Faculty_Name', key: 'faculty_name', width: 30 },
      { header: 'Faculty_ID', key: 'faculty_id', width: 10 },
    ];

    // Thêm dữ liệu mapping
    faculties.forEach(faculty => {
      hiddenSheet.addRow({
        faculty_name: faculty.name,
        faculty_id: faculty.id
      });
    });

    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Import teachers from Excel file
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
    
    const worksheet = workbook.getWorksheet('Teacher Template');
    if (!worksheet) {
      throw new BadRequestException('Invalid Excel file: "Teacher Template" worksheet not found');
    }

    // Get all faculties for mapping
    const faculties = await this.facultyRepository.find();

    // Create mapping from faculty_name to faculty entity
    const facultyMapping = new Map<string, Faculty>();
    faculties.forEach(faculty => {
      facultyMapping.set(faculty.name, faculty);
    });

    const errors: Array<{ row: number; message: string }> = [];
    const teachersToCreate: CreateTeacherDto[] = [];

    // Process each row (skip header row)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      try {
        const values = row.values as any[];
        const [, fullName, email, phone, address, gender, birthDate, qualification, department, facultyDisplay] = values;

        // Skip empty rows
        if (!fullName && !email && !phone && !address && !gender && !birthDate && !qualification && !department && !facultyDisplay) {
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

        if (!qualification) {
          errors.push({ row: rowNumber, message: 'Qualification is required' });
          return;
        }

        if (!department) {
          errors.push({ row: rowNumber, message: 'Department is required' });
          return;
        }

        if (!facultyDisplay) {
          errors.push({ row: rowNumber, message: 'Faculty is required' });
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
          const dateStr = birthDate.toString();
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(dateStr)) {
            errors.push({ row: rowNumber, message: 'Birth Date must be in YYYY-MM-DD format' });
            return;
          }
          birthDateString = dateStr;
        }

        // Validate faculty mapping
        const facultyEntity = facultyMapping.get(facultyDisplay.toString().trim());
        if (!facultyEntity) {
          errors.push({ row: rowNumber, message: `Invalid faculty name: ${facultyDisplay}. Please select from the faculty list.` });
          return;
        }

        // Create teacher DTO
        const createTeacherDto: CreateTeacherDto = {
          full_name: fullName.toString().trim(),
          email: email.toString().trim(),
          phone: phone.toString().trim(),
          address: address.toString().trim(),
          gender: genderValue,
          birth_date: birthDateString,
          qualification: qualification.toString().trim(),
          department: department.toString().trim(),
          faculty_id: facultyEntity.id
        };

        teachersToCreate.push(createTeacherDto);

      } catch (error) {
        errors.push({ row: rowNumber, message: `Error processing row: ${error.message}` });
      }
    });

    // Check for duplicate emails within the import
    const emailSet = new Set<string>();
    
    teachersToCreate.forEach((teacher, index) => {
      if (emailSet.has(teacher.email)) {
        errors.push({ 
          row: index + 2,
          message: `Duplicate email in import: ${teacher.email}` 
        });
      } else {
        emailSet.add(teacher.email);
      }
    });

    // Check for existing emails in database
    if (teachersToCreate.length > 0) {
      const emails = teachersToCreate.map(t => t.email);
      const existingTeachers = await this.teacherRepository.find({
        where: emails.map(email => ({ email })),
        select: ['email']
      });
      
      const existingEmails = new Set(existingTeachers.map(t => t.email));
      teachersToCreate.forEach((teacher, index) => {
        if (existingEmails.has(teacher.email)) {
          errors.push({ 
            row: index + 2,
            message: `Email already exists in database: ${teacher.email}` 
          });
        }
      });
    }

    // Filter out teachers with errors
    const validTeachers = teachersToCreate.filter((_, index) => 
      !errors.some(error => error.row === index + 2)
    );

    // Create teachers one by one using existing create logic
    let successCount = 0;
    if (validTeachers.length > 0) {
      for (const teacherDto of validTeachers) {
        try {
          await this.create(teacherDto);
          successCount++;
        } catch (error) {
          errors.push({ 
            row: teachersToCreate.indexOf(teacherDto) + 2,
            message: `Failed to create teacher: ${error.message}` 
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
   * Generate Excel file with 50 sample teachers
   */
  async downloadExcelWithSampleData(): Promise<Buffer> {
    // Lấy danh sách tất cả các khoa
    const faculties = await this.facultyRepository.find({
      order: { name: 'ASC' }
    });

    if (faculties.length === 0) {
      throw new NotFoundException('No faculties found');
    }

    // Tạo workbook
    const workbook = new ExcelJS.Workbook();

    // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
    const instructionSheet = workbook.addWorksheet('Hướng dẫn');
    instructionSheet.getColumn(1).width = 80;

    const instructions = [
      'HƯỚNG DẪN IMPORT GIẢNG VIÊN',
      '',
      '1. Điền đầy đủ thông tin vào sheet "Teacher Template"',
      '2. Ngày sinh: định dạng YYYY-MM-DD (VD: 1980-05-15)',
      '3. Giới tính: xem sheet "Gender Options" và copy chính xác',
      '   - Chỉ được điền: Male, Female, hoặc Other',
      '4. Khoa: xem sheet "Faculty Options" và copy Faculty Name',
      '   - VD: nếu muốn chọn khoa "Công nghệ thông tin", điền chính xác tên khoa',
      '5. Qualification: Trình độ học vấn (VD: Thạc sĩ, Tiến sĩ, ...)',
      '6. Department: Bộ môn trong khoa',
      '7. Email phải duy nhất (không trùng lặp)',
      '8. Xóa dòng ví dụ trước khi import',
      '',
      'CÁCH SỬ DỤNG:',
      '- Xem sheet "Gender Options" để biết các giá trị giới tính hợp lệ',
      '- Xem sheet "Faculty Options" để biết danh sách khoa và copy Faculty Name',
      '- Copy chính xác từ các sheet này vào sheet "Teacher Template"',
      '',
      'LƯU Ý: Tất cả các trường đều bắt buộc!'
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
    const worksheet = workbook.addWorksheet('Teacher Template');

    // Thiết lập các cột
    worksheet.columns = [
      { header: 'Full Name', key: 'full_name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Birth Date', key: 'birth_date', width: 15 },
      { header: 'Qualification', key: 'qualification', width: 20 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Faculty', key: 'faculty', width: 25 },
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

    // Tạo dữ liệu mẫu 50 giảng viên
    const genderOptions = ['Male', 'Female', 'Other'];
    const facultyOptions = faculties.map(faculty => faculty.name);
    
    const titles = ['TS.', 'ThS.', 'CN.', 'KS.', 'PGS.TS.', 'GS.TS.', ''];
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
    const middleNames = ['Văn', 'Thị', 'Minh', 'Hoàng', 'Thanh', 'Quang', 'Hữu', 'Đình', 'Xuân', 'Thu'];
    const firstNames = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Giang', 'Hà', 'Linh', 'Mai', 'Nam', 'Oanh', 'Phong', 'Quân', 'Sơn', 'Trang', 'Uyên', 'Vinh', 'Yến'];
    
    const qualifications = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'Phó Giáo sư', 'Giáo sư'];
    const departments = ['Khoa học máy tính', 'Kỹ thuật phần mềm', 'Hệ thống thông tin', 'Mạng máy tính', 'Trí tuệ nhân tạo', 'An toàn thông tin', 'Điện tử viễn thông', 'Cơ khí', 'Kinh tế', 'Quản trị kinh doanh'];
    
    const streetPrefixes = ['Đường', 'Phố', 'Ngõ'];
    const streetNames = ['Lê Lợi', 'Nguyễn Huệ', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Lý Thường Kiệt', 'Quang Trung', 'Lạc Long Quân', 'Âu Cơ', 'Điện Biên Phủ', 'Cộng Hòa'];
    const districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận Tân Bình', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Thủ Đức', 'Quận 7'];
    const cities = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

    for (let i = 1; i <= 50; i++) {
      // Tạo tên ngẫu nhiên
      const title = titles[Math.floor(Math.random() * titles.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const fullName = `${title} ${lastName} ${middleName} ${firstName}`.trim();

      // Tạo email duy nhất
      const emailPrefix = `${lastName.toLowerCase()}${middleName.toLowerCase()}${firstName.toLowerCase()}${String(i).padStart(2, '0')}`;
      const email = `${emailPrefix}@teacher.university.edu.vn`;

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

      // Tạo ngày sinh (từ 1970 đến 1990)
      const year = Math.floor(Math.random() * 21) + 1970;
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Tạo qualification và department
      const qualification = qualifications[Math.floor(Math.random() * qualifications.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];

      // Chọn khoa ngẫu nhiên
      const faculty = facultyOptions[Math.floor(Math.random() * facultyOptions.length)];

      // Thêm dữ liệu vào worksheet
      const row = worksheet.addRow({
        full_name: fullName,
        email: email,
        phone: phone,
        address: address,
        gender: gender,
        birth_date: birthDate,
        qualification: qualification,
        department: department,
        faculty: faculty
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

      // Highlight mỗi 5 dòng với màu khác
      if (i % 5 === 0) {
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

    // ===== SHEET: Faculty Options =====
    const facultySheet = workbook.addWorksheet('Faculty Options');
    facultySheet.columns = [
      { header: 'Faculty Name', key: 'faculty_name', width: 30 },
      { header: 'Faculty Code', key: 'faculty_code', width: 15 },
      { header: 'Dean', key: 'dean', width: 25 },
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

    // Tạo buffer và trả về
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
