import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Major } from 'src/entities/major.entity';
import { Faculty } from 'src/entities/faculty.entity';
import { CreateMajorDto, UpdateMajorDto } from './dto';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';
import * as ExcelJS from 'exceljs';

@Injectable()
export class MajorService {
    constructor(
        @InjectRepository(Major)
        private majorRepository: Repository<Major>,
        @InjectRepository(Faculty)
        private facultyRepository: Repository<Faculty>,
    ) {}

    async create(createMajorDto: CreateMajorDto): Promise<Major> {
        // Check if faculty exists
        const faculty = await this.facultyRepository.findOneBy({ id: createMajorDto.faculty_id });
        if (!faculty) {
            throw new NotFoundException(ErrorMessages.MAJOR.FACULTY_NOT_FOUND);
        }

        // Check if name exists
        const existingName = await this.majorRepository.findOneBy({ name: createMajorDto.name });
        if (existingName) {
            throw new ConflictException(ErrorMessages.MAJOR.EXIST);
        }

        // Check if code exists
        const existingCode = await this.majorRepository.findOneBy({ code: createMajorDto.code });
        if (existingCode) {
            throw new ConflictException(ErrorMessages.MAJOR.CODE_EXIST);
        }

        const major = this.majorRepository.create(createMajorDto);
        return this.majorRepository.save(major);
    }

    async findAll(): Promise<Major[]> {
        return this.majorRepository.find({
            relations: ['faculty'],
            order: { name: 'ASC' }
        });
    }

    async findOne(id: number): Promise<Major> {
        const major = await this.majorRepository.findOne({
            where: { id },
            relations: ['faculty']
        });
        if (!major) {
            throw new NotFoundException(ErrorMessages.MAJOR.NOT_FOUND);
        }
        return major;
    }

    async update(id: number, updateMajorDto: UpdateMajorDto): Promise<Major> {
        const major = await this.findOne(id);

        // Check if faculty exists if faculty_id is being updated
        if (updateMajorDto.faculty_id) {
            const faculty = await this.facultyRepository.findOneBy({ id: updateMajorDto.faculty_id });
            if (!faculty) {
                throw new NotFoundException(ErrorMessages.MAJOR.FACULTY_NOT_FOUND);
            }
        }

        // Check if name exists if name is being updated
        if (updateMajorDto.name && updateMajorDto.name !== major.name) {
            const existingName = await this.majorRepository.findOneBy({ name: updateMajorDto.name });
            if (existingName) {
                throw new ConflictException(ErrorMessages.MAJOR.EXIST);
            }
        }

        // Check if code exists if code is being updated
        if (updateMajorDto.code && updateMajorDto.code !== major.code) {
            const existingCode = await this.majorRepository.findOneBy({ code: updateMajorDto.code });
            if (existingCode) {
                throw new ConflictException(ErrorMessages.MAJOR.CODE_EXIST);
            }
        }

        Object.assign(major, updateMajorDto);
        return this.majorRepository.save(major);
    }

    async remove(id: number): Promise<void> {
        const result = await this.majorRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(ErrorMessages.MAJOR.NOT_FOUND);
        }
    }

    /**
     * Generate Excel template for major import
     */
    async downloadExcelTemplate(): Promise<Buffer> {
        // Lấy danh sách tất cả các khoa
        const faculties = await this.facultyRepository.find({
            order: { name: 'ASC' }
        });

        if (faculties.length === 0) {
            throw new NotFoundException('No faculties found. Please create at least one faculty first.');
        }

        // Tạo workbook
        const workbook = new ExcelJS.Workbook();

        // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT NGÀNH',
            '',
            '1. Điền đầy đủ thông tin vào sheet "Major Template"',
            '2. Name: Tên ngành (VD: Công nghệ Thông tin)',
            '3. Code: Mã ngành duy nhất (VD: CNTT, KTPM)',
            '4. Description: Mô tả về ngành (có thể để trống)',
            '5. Faculty: Chọn khoa từ danh sách trong sheet "Faculty Options"',
            '   - Copy chính xác tên khoa từ sheet "Faculty Options"',
            '6. Xóa dòng ví dụ trước khi import',
            '',
            'LƯU Ý:',
            '- Name, Code và Faculty là bắt buộc',
            '- Code phải duy nhất trong hệ thống',
            '- Description có thể để trống',
            '- Faculty phải tồn tại trong hệ thống'
        ];

        instructions.forEach((instruction, index) => {
            const row = instructionSheet.addRow([instruction]);
            if (index === 0) {
                row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
            } else if (instruction.startsWith('LƯU Ý:')) {
                row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
            }
        });

        // ===== SHEET CHÍNH: Major Template =====
        const worksheet = workbook.addWorksheet('Major Template');

        // Thiết lập các cột với định dạng
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 40 },
            { header: 'Code', key: 'code', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Faculty', key: 'faculty', width: 40 },
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
            name: 'Công nghệ Thông tin',
            code: 'CNTT',
            description: 'Chương trình đào tạo về công nghệ thông tin, lập trình và phát triển phần mềm',
            faculty: faculties[0].name
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

        // ===== SHEET ẨN: Faculty Mapping =====
        const hiddenSheet = workbook.addWorksheet('FacultyMapping');
        hiddenSheet.state = 'hidden';

        hiddenSheet.columns = [
            { header: 'Faculty_Name', key: 'faculty_name', width: 40 },
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
     * Import majors from Excel file
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
        
        const worksheet = workbook.getWorksheet('Major Template');
        if (!worksheet) {
            throw new BadRequestException('Invalid Excel file: "Major Template" worksheet not found');
        }

        // Get all faculties for mapping
        const faculties = await this.facultyRepository.find();

        // Create mapping from faculty name to faculty entity
        const facultyMapping = new Map<string, Faculty>();
        faculties.forEach(faculty => {
            facultyMapping.set(faculty.name, faculty);
        });

        const errors: Array<{ row: number; message: string }> = [];
        const majorsToCreate: CreateMajorDto[] = [];

        // Process each row (skip header row)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            try {
                const values = row.values as any[];
                const [, name, code, description, facultyName] = values;

                // Skip empty rows
                if (!name && !code && !description && !facultyName) {
                    return;
                }

                // Validate required fields
                if (!name) {
                    errors.push({ row: rowNumber, message: 'Name is required' });
                    return;
                }

                if (!code) {
                    errors.push({ row: rowNumber, message: 'Code is required' });
                    return;
                }

                if (!facultyName) {
                    errors.push({ row: rowNumber, message: 'Faculty is required' });
                    return;
                }

                // Validate faculty mapping
                const facultyEntity = facultyMapping.get(facultyName.toString().trim());
                if (!facultyEntity) {
                    errors.push({ row: rowNumber, message: `Invalid faculty name: ${facultyName}. Please select from the faculty list.` });
                    return;
                }

                // Create major DTO
                const createMajorDto: CreateMajorDto = {
                    name: name.toString().trim(),
                    code: code.toString().trim(),
                    description: description ? description.toString().trim() : undefined,
                    faculty_id: facultyEntity.id
                };

                majorsToCreate.push(createMajorDto);

            } catch (error) {
                errors.push({ row: rowNumber, message: `Error processing row: ${error.message}` });
            }
        });

        // Check for duplicate names and codes within the import
        const nameSet = new Set<string>();
        const codeSet = new Set<string>();
        
        majorsToCreate.forEach((major, index) => {
            if (nameSet.has(major.name)) {
                errors.push({ 
                    row: index + 2,
                    message: `Duplicate name in import: ${major.name}` 
                });
            } else {
                nameSet.add(major.name);
            }

            if (codeSet.has(major.code)) {
                errors.push({ 
                    row: index + 2,
                    message: `Duplicate code in import: ${major.code}` 
                });
            } else {
                codeSet.add(major.code);
            }
        });

        // Check for existing names and codes in database
        if (majorsToCreate.length > 0) {
            const names = majorsToCreate.map(m => m.name);
            const codes = majorsToCreate.map(m => m.code);
            
            const existingMajors = await this.majorRepository.find({
                where: [
                    ...names.map(name => ({ name })),
                    ...codes.map(code => ({ code }))
                ],
                select: ['name', 'code']
            });
            
            const existingNames = new Set(existingMajors.map(m => m.name));
            const existingCodes = new Set(existingMajors.map(m => m.code));
            
            majorsToCreate.forEach((major, index) => {
                if (existingNames.has(major.name)) {
                    errors.push({ 
                        row: index + 2,
                        message: `Major name already exists: ${major.name}` 
                    });
                }
                if (existingCodes.has(major.code)) {
                    errors.push({ 
                        row: index + 2,
                        message: `Major code already exists: ${major.code}` 
                    });
                }
            });
        }

        // Filter out majors with errors
        const validMajors = majorsToCreate.filter((_, index) => 
            !errors.some(error => error.row === index + 2)
        );

        // Create majors one by one using existing create logic
        let successCount = 0;
        if (validMajors.length > 0) {
            for (const majorDto of validMajors) {
                try {
                    await this.create(majorDto);
                    successCount++;
                } catch (error) {
                    errors.push({ 
                        row: majorsToCreate.indexOf(majorDto) + 2,
                        message: `Failed to create major: ${error.message}` 
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
     * Generate Excel file with sample majors
     */
    async downloadExcelWithSampleData(): Promise<Buffer> {
        // Lấy danh sách tất cả các khoa
        const faculties = await this.facultyRepository.find({
            order: { name: 'ASC' }
        });

        if (faculties.length === 0) {
            throw new NotFoundException('No faculties found. Please create at least one faculty first.');
        }

        // Tạo workbook
        const workbook = new ExcelJS.Workbook();

        // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT NGÀNH',
            '',
            '1. Điền đầy đủ thông tin vào sheet "Major Template"',
            '2. Name: Tên ngành (VD: Công nghệ Thông tin)',
            '3. Code: Mã ngành duy nhất (VD: CNTT, KTPM)',
            '4. Description: Mô tả về ngành (có thể để trống)',
            '5. Faculty: Chọn khoa từ danh sách trong sheet "Faculty Options"',
            '   - Copy chính xác tên khoa từ sheet "Faculty Options"',
            '6. Xóa dòng ví dụ trước khi import',
            '',
            'LƯU Ý:',
            '- Name, Code và Faculty là bắt buộc',
            '- Code phải duy nhất trong hệ thống',
            '- Description có thể để trống',
            '- Faculty phải tồn tại trong hệ thống'
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
        const worksheet = workbook.addWorksheet('Major Template');

        // Thiết lập các cột
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 40 },
            { header: 'Code', key: 'code', width: 15 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Faculty', key: 'faculty', width: 40 },
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
        const sampleMajors = [];
        faculties.forEach(faculty => {
            switch (faculty.code) {
                case 'CNTT':
                    sampleMajors.push(
                        { name: 'Công nghệ Thông tin', code: 'CNTT', description: 'Chương trình đào tạo về công nghệ thông tin, lập trình và phát triển phần mềm', faculty: faculty.name },
                        { name: 'Kỹ thuật Phần mềm', code: 'KTPM', description: 'Chuyên sâu về quy trình phát triển và kiểm thử phần mềm', faculty: faculty.name },
                        { name: 'An toàn Thông tin', code: 'ATTT', description: 'Bảo mật và an ninh mạng', faculty: faculty.name }
                    );
                    break;
                case 'KT':
                    sampleMajors.push(
                        { name: 'Kinh tế Học', code: 'KTH', description: 'Nghiên cứu về kinh tế vĩ mô và vi mô', faculty: faculty.name },
                        { name: 'Quản trị Kinh doanh', code: 'QTKD', description: 'Quản lý và điều hành doanh nghiệp', faculty: faculty.name }
                    );
                    break;
                case 'DDT':
                    sampleMajors.push(
                        { name: 'Kỹ thuật Điện', code: 'KTD', description: 'Hệ thống điện và năng lượng', faculty: faculty.name },
                        { name: 'Điện tử Viễn thông', code: 'DTVT', description: 'Công nghệ viễn thông và truyền thông', faculty: faculty.name }
                    );
                    break;
                default:
                    sampleMajors.push(
                        { name: `${faculty.name} - Chuyên ngành 1`, code: `${faculty.code}1`, description: `Chương trình đào tạo 1 của ${faculty.name}`, faculty: faculty.name },
                        { name: `${faculty.name} - Chuyên ngành 2`, code: `${faculty.code}2`, description: `Chương trình đào tạo 2 của ${faculty.name}`, faculty: faculty.name }
                    );
            }
        });

        // Thêm dữ liệu vào worksheet
        sampleMajors.forEach((major, index) => {
            const row = worksheet.addRow(major);

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

        // Tạo buffer và trả về
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
} 