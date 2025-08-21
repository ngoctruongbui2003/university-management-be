import { DataSource } from 'typeorm';
import { Course } from '../entities/course.entity';

export async function seedCourses(dataSource: DataSource) {
    const repo = dataSource.getRepository(Course);

    // Kiểm tra xem đã có dữ liệu chưa
    const existingCourses = await repo.count();
    if (existingCourses > 0) {
        console.log('⚠️  Courses already seeded, skipping...');
        return;
    }

    const courses = [
        // Semester 1 - Subject IDs giả định từ 1-10, Teacher IDs từ 1-5
        {
            subject_id: 1,
            semester_id: 1,
            teacher_id: 1,
            class_code: 'CS101-01',
            max_students: 50,
            current_students: 0,
            description: 'Lớp học Nhập môn Khoa học máy tính - Buổi sáng'
        },
        {
            subject_id: 1,
            semester_id: 1,
            teacher_id: 2,
            class_code: 'CS101-02',
            max_students: 45,
            current_students: 0,
            description: 'Lớp học Nhập môn Khoa học máy tính - Buổi chiều'
        },
        {
            subject_id: 2,
            semester_id: 1,
            teacher_id: 1,
            class_code: 'MATH101-01',
            max_students: 60,
            current_students: 0,
            description: 'Lớp học Toán cao cấp 1'
        },
        {
            subject_id: 3,
            semester_id: 1,
            teacher_id: 3,
            class_code: 'ENG101-01',
            max_students: 40,
            current_students: 0,
            description: 'Lớp học Tiếng Anh cơ bản'
        },
        {
            subject_id: 4,
            semester_id: 1,
            teacher_id: 2,
            class_code: 'PHYS101-01',
            max_students: 50,
            current_students: 0,
            description: 'Lớp học Vật lý đại cương'
        },

        // Semester 2
        {
            subject_id: 5,
            semester_id: 2,
            teacher_id: 4,
            class_code: 'CS102-01',
            max_students: 45,
            current_students: 0,
            description: 'Lớp học Lập trình hướng đối tượng'
        },
        {
            subject_id: 6,
            semester_id: 2,
            teacher_id: 5,
            class_code: 'DB101-01',
            max_students: 40,
            current_students: 0,
            description: 'Lớp học Cơ sở dữ liệu'
        },
        {
            subject_id: 2,
            semester_id: 2,
            teacher_id: 1,
            class_code: 'MATH102-01',
            max_students: 55,
            current_students: 0,
            description: 'Lớp học Toán cao cấp 2'
        },
        {
            subject_id: 7,
            semester_id: 2,
            teacher_id: 3,
            class_code: 'ALGO101-01',
            max_students: 35,
            current_students: 0,
            description: 'Lớp học Thuật toán và cấu trúc dữ liệu'
        },
        {
            subject_id: 8,
            semester_id: 2,
            teacher_id: 4,
            class_code: 'NET101-01',
            max_students: 30,
            current_students: 0,
            description: 'Lớp học Mạng máy tính'
        },

        // Semester 3 - Các môn nâng cao
        {
            subject_id: 9,
            semester_id: 3,
            teacher_id: 5,
            class_code: 'WEB101-01',
            max_students: 40,
            current_students: 0,
            description: 'Lớp học Phát triển Web'
        },
        {
            subject_id: 10,
            semester_id: 3,
            teacher_id: 2,
            class_code: 'AI101-01',
            max_students: 25,
            current_students: 0,
            description: 'Lớp học Trí tuệ nhân tạo'
        },
        {
            subject_id: 5,
            semester_id: 3,
            teacher_id: 1,
            class_code: 'CS102-02',
            max_students: 45,
            current_students: 0,
            description: 'Lớp học Lập trình hướng đối tượng - Lớp 2'
        },
        {
            subject_id: 11,
            semester_id: 3,
            teacher_id: 4,
            class_code: 'SE101-01',
            max_students: 35,
            current_students: 0,
            description: 'Lớp học Công nghệ phần mềm'
        },
        {
            subject_id: 12,
            semester_id: 3,
            teacher_id: 3,
            class_code: 'ML101-01',
            max_students: 30,
            current_students: 0,
            description: 'Lớp học Machine Learning'
        },

        // Thêm một số lớp học với số lượng sinh viên hiện tại khác 0
        {
            subject_id: 1,
            semester_id: 1,
            teacher_id: 5,
            class_code: 'CS101-03',
            max_students: 50,
            current_students: 25,
            description: 'Lớp học Nhập môn Khoa học máy tính - Lớp đã có sinh viên'
        },
        {
            subject_id: 6,
            semester_id: 2,
            teacher_id: 1,
            class_code: 'DB101-02',
            max_students: 40,
            current_students: 30,
            description: 'Lớp học Cơ sở dữ liệu - Lớp 2'
        },
        {
            subject_id: 9,
            semester_id: 3,
            teacher_id: 2,
            class_code: 'WEB101-02',
            max_students: 35,
            current_students: 15,
            description: 'Lớp học Phát triển Web - Lớp 2'
        }
    ];

    const courseEntities = courses.map(course => repo.create(course));
    await repo.save(courseEntities);
    
    console.log(`✅ Seeded ${courses.length} courses!`);
}
