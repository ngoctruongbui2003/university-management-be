import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from 'src/entities/faculty.entity';
import { CreateFacultyDto, UpdateFacultyDto } from './dto';
import { ErrorMessages } from 'src/shared/constants/error-messages.constant';
import * as ExcelJS from 'exceljs';

@Injectable()
export class FacultyService {
    constructor(
        @InjectRepository(Faculty)
        private facultyRepository: Repository<Faculty>,
    ) {}

    async create(createFacultyDto: CreateFacultyDto): Promise<Faculty> {
        const existing = await this.facultyRepository.findOneBy({ 
            name: createFacultyDto.name,
            code: createFacultyDto.code
        });
        if (existing) {
            throw new ConflictException(ErrorMessages.FACULTY.EXIST);
        }
        const faculty = this.facultyRepository.create(createFacultyDto);
        return this.facultyRepository.save(faculty);
    }

    async findAll(): Promise<Faculty[]> {
        return this.facultyRepository.find({ order: { name: 'ASC' }, relations: ['majors'] });
    }

    async findOne(id: number): Promise<Faculty> {
        const faculty = await this.facultyRepository.findOne({
            where: { id },
            relations: ['majors']
        });
        if (!faculty) throw new NotFoundException(ErrorMessages.FACULTY.NOT_FOUND);
        return faculty;
    }

    async update(id: number, updateFacultyDto: UpdateFacultyDto): Promise<Faculty> {
        const faculty = await this.findOne(id);
        if (updateFacultyDto.name && updateFacultyDto.name !== faculty.name) {
            const existing = await this.facultyRepository.findOneBy({ name: updateFacultyDto.name });
            if (existing) throw new ConflictException(ErrorMessages.FACULTY.EXIST);
        }
        Object.assign(faculty, updateFacultyDto);
        return this.facultyRepository.save(faculty);
    }

    async remove(id: number): Promise<void> {
        const result = await this.facultyRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(ErrorMessages.FACULTY.NOT_FOUND);
    }

    /**
     * Generate Excel template for faculty import
     */
    async downloadExcelTemplate(): Promise<Buffer> {
        // Tạo workbook
        const workbook = new ExcelJS.Workbook();

        // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT KHOA',
            '',
            '1. Điền đầy đủ thông tin vào sheet "Faculty Template"',
            '2. Name: Tên khoa (VD: Khoa Công nghệ Thông tin)',
            '3. Code: Mã khoa duy nhất (VD: CNTT, CK, KT)',
            '4. Dean: Tên trưởng khoa (có thể để trống)',
            '5. Contact Info: Thông tin liên lạc (có thể để trống)',
            '6. Xóa dòng ví dụ trước khi import',
            '',
            'LƯU Ý:',
            '- Name và Code là bắt buộc',
            '- Code phải duy nhất trong hệ thống',
            '- Dean và Contact Info có thể để trống'
        ];

        instructions.forEach((instruction, index) => {
            const row = instructionSheet.addRow([instruction]);
            if (index === 0) {
                row.getCell(1).font = { bold: true, size: 14, color: { argb: '0066CC' } };
            } else if (instruction.startsWith('LƯU Ý:')) {
                row.getCell(1).font = { bold: true, color: { argb: 'FF0000' } };
            }
        });

        // ===== SHEET CHÍNH: Faculty Template =====
        const worksheet = workbook.addWorksheet('Faculty Template');

        // Thiết lập các cột với định dạng
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 40 },
            { header: 'Code', key: 'code', width: 15 },
            { header: 'Dean', key: 'dean', width: 30 },
            { header: 'Contact Info', key: 'contact_info', width: 50 },
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
            name: 'Khoa Công nghệ Thông tin',
            code: 'CNTT',
            dean: 'PGS.TS. Nguyễn Văn An',
            contact_info: 'Email: cntt@university.edu.vn, Phone: 0123456789'
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

        // Tạo buffer và trả về
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    /**
     * Import faculties from Excel file
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
        
        const worksheet = workbook.getWorksheet('Faculty Template');
        if (!worksheet) {
            throw new BadRequestException('Invalid Excel file: "Faculty Template" worksheet not found');
        }

        const errors: Array<{ row: number; message: string }> = [];
        const facultiesToCreate: CreateFacultyDto[] = [];

        // Process each row (skip header row)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            try {
                const values = row.values as any[];
                const [, name, code, dean, contactInfo] = values;

                // Skip empty rows
                if (!name && !code && !dean && !contactInfo) {
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

                // Create faculty DTO
                const createFacultyDto: CreateFacultyDto = {
                    name: name.toString().trim(),
                    code: code.toString().trim(),
                    dean: dean ? dean.toString().trim() : undefined,
                    contact_info: contactInfo ? contactInfo.toString().trim() : undefined
                };

                facultiesToCreate.push(createFacultyDto);

            } catch (error) {
                errors.push({ row: rowNumber, message: `Error processing row: ${error.message}` });
            }
        });

        // Check for duplicate names within the import
        const nameSet = new Set<string>();
        const codeSet = new Set<string>();
        
        facultiesToCreate.forEach((faculty, index) => {
            if (nameSet.has(faculty.name)) {
                errors.push({ 
                    row: index + 2,
                    message: `Duplicate name in import: ${faculty.name}` 
                });
            } else {
                nameSet.add(faculty.name);
            }

            if (codeSet.has(faculty.code)) {
                errors.push({ 
                    row: index + 2,
                    message: `Duplicate code in import: ${faculty.code}` 
                });
            } else {
                codeSet.add(faculty.code);
            }
        });

        // Check for existing names and codes in database
        if (facultiesToCreate.length > 0) {
            const names = facultiesToCreate.map(f => f.name);
            const codes = facultiesToCreate.map(f => f.code);
            
            const existingFaculties = await this.facultyRepository.find({
                where: [
                    ...names.map(name => ({ name })),
                    ...codes.map(code => ({ code }))
                ],
                select: ['name', 'code']
            });
            
            const existingNames = new Set(existingFaculties.map(f => f.name));
            const existingCodes = new Set(existingFaculties.map(f => f.code));
            
            facultiesToCreate.forEach((faculty, index) => {
                if (existingNames.has(faculty.name)) {
                    errors.push({ 
                        row: index + 2,
                        message: `Faculty name already exists: ${faculty.name}` 
                    });
                }
                if (existingCodes.has(faculty.code)) {
                    errors.push({ 
                        row: index + 2,
                        message: `Faculty code already exists: ${faculty.code}` 
                    });
                }
            });
        }

        // Filter out faculties with errors
        const validFaculties = facultiesToCreate.filter((_, index) => 
            !errors.some(error => error.row === index + 2)
        );

        // Create faculties one by one using existing create logic
        let successCount = 0;
        if (validFaculties.length > 0) {
            for (const facultyDto of validFaculties) {
                try {
                    await this.create(facultyDto);
                    successCount++;
                } catch (error) {
                    errors.push({ 
                        row: facultiesToCreate.indexOf(facultyDto) + 2,
                        message: `Failed to create faculty: ${error.message}` 
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
     * Generate Excel file with 20 sample faculties
     */
    async downloadExcelWithSampleData(): Promise<Buffer> {
        // Tạo workbook
        const workbook = new ExcelJS.Workbook();

        // ===== SHEET HƯỚNG DẪN (ĐẦU TIÊN) =====
        const instructionSheet = workbook.addWorksheet('Hướng dẫn');
        instructionSheet.getColumn(1).width = 80;

        const instructions = [
            'HƯỚNG DẪN IMPORT KHOA',
            '',
            '1. Điền đầy đủ thông tin vào sheet "Faculty Template"',
            '2. Name: Tên khoa (VD: Khoa Công nghệ Thông tin)',
            '3. Code: Mã khoa duy nhất (VD: CNTT, CK, KT)',
            '4. Dean: Tên trưởng khoa (có thể để trống)',
            '5. Contact Info: Thông tin liên lạc (có thể để trống)',
            '6. Xóa dòng ví dụ trước khi import',
            '',
            'LƯU Ý:',
            '- Name và Code là bắt buộc',
            '- Code phải duy nhất trong hệ thống',
            '- Dean và Contact Info có thể để trống'
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
        const worksheet = workbook.addWorksheet('Faculty Template');

        // Thiết lập các cột
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 40 },
            { header: 'Code', key: 'code', width: 15 },
            { header: 'Dean', key: 'dean', width: 30 },
            { header: 'Contact Info', key: 'contact_info', width: 50 },
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

        // Tạo dữ liệu mẫu 20 khoa
        const facultyData = [
            { name: 'Khoa Công nghệ Thông tin', code: 'CNTT', dean: 'PGS.TS. Nguyễn Văn An', contact: 'cntt@university.edu.vn, 0123456789' },
            { name: 'Khoa Cơ khí', code: 'CK', dean: 'TS. Trần Văn Bình', contact: 'cokhi@university.edu.vn, 0123456790' },
            { name: 'Khoa Điện - Điện tử', code: 'DDT', dean: 'PGS.TS. Lê Thị Cúc', contact: 'ddt@university.edu.vn, 0123456791' },
            { name: 'Khoa Kinh tế', code: 'KT', dean: 'TS. Phạm Minh Dũng', contact: 'kinhte@university.edu.vn, 0123456792' },
            { name: 'Khoa Xây dựng', code: 'XD', dean: 'GS.TS. Hoàng Văn Em', contact: 'xaydung@university.edu.vn, 0123456793' },
            { name: 'Khoa Hóa học', code: 'HH', dean: 'TS. Vũ Thị Giang', contact: 'hoahoc@university.edu.vn, 0123456794' },
            { name: 'Khoa Vật lý', code: 'VL', dean: 'PGS.TS. Đặng Văn Hà', contact: 'vatly@university.edu.vn, 0123456795' },
            { name: 'Khoa Toán học', code: 'TH', dean: 'TS. Bùi Thị Linh', contact: 'toanhoc@university.edu.vn, 0123456796' },
            { name: 'Khoa Sinh học', code: 'SH', dean: 'TS. Đỗ Văn Mai', contact: 'sinhhoc@university.edu.vn, 0123456797' },
            { name: 'Khoa Ngoại ngữ', code: 'NN', dean: 'TS. Hồ Thị Nga', contact: 'ngoaingu@university.edu.vn, 0123456798' },
            { name: 'Khoa Luật', code: 'L', dean: 'PGS.TS. Ngô Văn Oanh', contact: 'luat@university.edu.vn, 0123456799' },
            { name: 'Khoa Y học', code: 'Y', dean: 'GS.TS. Dương Văn Phong', contact: 'yhoc@university.edu.vn, 0123456800' },
            { name: 'Khoa Dược', code: 'D', dean: 'TS. Phan Thị Quỳnh', contact: 'duoc@university.edu.vn, 0123456801' },
            { name: 'Khoa Nông nghiệp', code: 'NN2', dean: 'TS. Huỳnh Văn Sơn', contact: 'nongnghiep@university.edu.vn, 0123456802' },
            { name: 'Khoa Thủy sản', code: 'TS', dean: 'TS. Võ Thị Trang', contact: 'thuysan@university.edu.vn, 0123456803' },
            { name: 'Khoa Môi trường', code: 'MT', dean: 'PGS.TS. Lê Văn Uyên', contact: 'moitruong@university.edu.vn, 0123456804' },
            { name: 'Khoa Nghệ thuật', code: 'NT', dean: 'TS. Trần Thị Vinh', contact: 'nghethuat@university.edu.vn, 0123456805' },
            { name: 'Khoa Thể dục thể thao', code: 'TDTT', dean: 'ThS. Nguyễn Văn Yến', contact: 'tdtt@university.edu.vn, 0123456806' },
            { name: 'Khoa Giáo dục', code: 'GD', dean: 'TS. Phạm Thị Anh', contact: 'giaoduc@university.edu.vn, 0123456807' },
            { name: 'Khoa Du lịch', code: 'DL', dean: 'TS. Hoàng Văn Bảo', contact: 'dulich@university.edu.vn, 0123456808' }
        ];

        facultyData.forEach((faculty, index) => {
            // Thêm dữ liệu vào worksheet
            const row = worksheet.addRow({
                name: faculty.name,
                code: faculty.code,
                dean: faculty.dean,
                contact_info: faculty.contact
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
            if ((index + 1) % 5 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'F0F8FF' }
                    };
                });
            }
        });

        // Tạo buffer và trả về
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
} 