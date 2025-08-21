import { DataSource } from 'typeorm';
import { CourseSchedule } from '../entities/course-schedule.entity';
import { DayOfWeek } from '../shared/constants/enum';

export async function seedCourseSchedules(dataSource: DataSource) {
    const repo = dataSource.getRepository(CourseSchedule);

    // Kiểm tra xem đã có dữ liệu chưa
    const existingSchedules = await repo.count();
    if (existingSchedules > 0) {
        console.log('⚠️  Course schedules already seeded, skipping...');
        return;
    }

    // Danh sách các phòng học
    const rooms = [
        'A101', 'A102', 'A103', 'A201', 'A202', 'A203',
        'B101', 'B102', 'B103', 'B201', 'B202', 'B203',
        'C101', 'C102', 'C103', 'LAB01', 'LAB02', 'LAB03'
    ];

    const schedules = [
        // Course ID 1: CS101-01 - Thứ 2 & Thứ 4
        {
            course_id: 1,
            day_of_week: DayOfWeek.MONDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'A101'
        },
        {
            course_id: 1,
            day_of_week: DayOfWeek.THURSDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'A101'
        },

        // Course ID 2: CS101-02 - Thứ 2 & Thứ 4 (buổi chiều)
        {
            course_id: 2,
            day_of_week: DayOfWeek.MONDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'A102'
        },
        {
            course_id: 2,
            day_of_week: DayOfWeek.THURSDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'A102'
        },

        // Course ID 3: MATH101-01 - Thứ 3 & Thứ 6
        {
            course_id: 3,
            day_of_week: DayOfWeek.TUESDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'B101'
        },
        {
            course_id: 3,
            day_of_week: DayOfWeek.FRIDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'B101'
        },

        // Course ID 4: ENG101-01 - Thứ 3 & Thứ 5
        {
            course_id: 4,
            day_of_week: DayOfWeek.TUESDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'A201'
        },
        {
            course_id: 4,
            day_of_week: DayOfWeek.FRIDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'A201'
        },

        // Course ID 5: PHYS101-01 - Thứ 4 & Thứ 6
        {
            course_id: 5,
            day_of_week: DayOfWeek.WEDNESDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'C101'
        },
        {
            course_id: 5,
            day_of_week: DayOfWeek.SATURDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'C101'
        },

        // Course ID 6: CS102-01 - Thứ 2 & Thứ 4 (có thực hành)
        {
            course_id: 6,
            day_of_week: DayOfWeek.MONDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'A103'
        },
        {
            course_id: 6,
            day_of_week: DayOfWeek.THURSDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'LAB01'
        },

        // Course ID 7: DB101-01 - Thứ 3 & Thứ 5 (có thực hành)
        {
            course_id: 7,
            day_of_week: DayOfWeek.TUESDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'B201'
        },
        {
            course_id: 7,
            day_of_week: DayOfWeek.FRIDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'LAB02'
        },

        // Course ID 8: MATH102-01 - Thứ 2 & Thứ 5
        {
            course_id: 8,
            day_of_week: DayOfWeek.MONDAY,
            period_start: 10,
            period_end: 12,
            week_start: 1,
            week_end: 15,
            room: 'B102'
        },
        {
            course_id: 8,
            day_of_week: DayOfWeek.FRIDAY,
            period_start: 10,
            period_end: 12,
            week_start: 1,
            week_end: 15,
            room: 'B102'
        },

        // Course ID 9: ALGO101-01 - Thứ 3 & Thứ 6
        {
            course_id: 9,
            day_of_week: DayOfWeek.WEDNESDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'A202'
        },
        {
            course_id: 9,
            day_of_week: DayOfWeek.SATURDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'A202'
        },

        // Course ID 10: NET101-01 - Thứ 4 & Thứ 6 (có thực hành)
        {
            course_id: 10,
            day_of_week: DayOfWeek.WEDNESDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'B203'
        },
        {
            course_id: 10,
            day_of_week: DayOfWeek.SATURDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'LAB03'
        },

        // Course ID 11: WEB101-01 - Thứ 2 & Thứ 5 (toàn thực hành)
        {
            course_id: 11,
            day_of_week: DayOfWeek.TUESDAY,
            period_start: 1,
            period_end: 4,
            week_start: 1,
            week_end: 15,
            room: 'LAB01'
        },
        {
            course_id: 11,
            day_of_week: DayOfWeek.FRIDAY,
            period_start: 1,
            period_end: 4,
            week_start: 1,
            week_end: 15,
            room: 'LAB01'
        },

        // Course ID 12: AI101-01 - Thứ 3 & Thứ 6
        {
            course_id: 12,
            day_of_week: DayOfWeek.WEDNESDAY,
            period_start: 10,
            period_end: 12,
            week_start: 1,
            week_end: 15,
            room: 'C102'
        },
        {
            course_id: 12,
            day_of_week: DayOfWeek.SATURDAY,
            period_start: 10,
            period_end: 12,
            week_start: 1,
            week_end: 15,
            room: 'C102'
        },

        // Course ID 13: CS102-02 - Thứ 3 & Thứ 5
        {
            course_id: 13,
            day_of_week: DayOfWeek.TUESDAY,
            period_start: 10,
            period_end: 12,
            week_start: 1,
            week_end: 15,
            room: 'A203'
        },
        {
            course_id: 13,
            day_of_week: DayOfWeek.FRIDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'LAB02'
        },

        // Course ID 14: SE101-01 - Thứ 4 & Thứ 7
        {
            course_id: 14,
            day_of_week: DayOfWeek.THURSDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'C103'
        },
        {
            course_id: 14,
            day_of_week: DayOfWeek.SUNDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'C103'
        },

        // Course ID 15: ML101-01 - Thứ 5 & Thứ 7 (có thực hành)
        {
            course_id: 15,
            day_of_week: DayOfWeek.THURSDAY,
            period_start: 10,
            period_end: 12,
            week_start: 1,
            week_end: 15,
            room: 'B202'
        },
        {
            course_id: 15,
            day_of_week: DayOfWeek.SUNDAY,
            period_start: 4,
            period_end: 6,
            week_start: 1,
            week_end: 15,
            room: 'LAB03'
        },

        // Course ID 16: CS101-03 - Thứ 6 & Thứ 7
        {
            course_id: 16,
            day_of_week: DayOfWeek.FRIDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'A103'
        },
        {
            course_id: 16,
            day_of_week: DayOfWeek.SUNDAY,
            period_start: 7,
            period_end: 9,
            week_start: 1,
            week_end: 15,
            room: 'A103'
        },

        // Course ID 17: DB101-02 - Thứ 4 & Thứ 6
        {
            course_id: 17,
            day_of_week: DayOfWeek.WEDNESDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'B203'
        },
        {
            course_id: 17,
            day_of_week: DayOfWeek.SATURDAY,
            period_start: 1,
            period_end: 3,
            week_start: 1,
            week_end: 15,
            room: 'LAB01'
        },

        // Course ID 18: WEB101-02 - Thứ 5 & Thứ 7
        {
            course_id: 18,
            day_of_week: DayOfWeek.THURSDAY,
            period_start: 7,
            period_end: 10,
            week_start: 1,
            week_end: 15,
            room: 'LAB02'
        },
        {
            course_id: 18,
            day_of_week: DayOfWeek.SUNDAY,
            period_start: 10,
            period_end: 12,
            week_start: 1,
            week_end: 15,
            room: 'LAB02'
        }
    ];

    const scheduleEntities = schedules.map(schedule => repo.create(schedule));
    await repo.save(scheduleEntities);
    
    console.log(`✅ Seeded ${schedules.length} course schedules!`);
}
