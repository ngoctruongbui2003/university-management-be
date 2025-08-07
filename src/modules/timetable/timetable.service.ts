import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Registration } from '../../entities/registration.entity';
import { Student } from '../../entities/student.entity';
import { CourseSchedule } from '../../entities/course-schedule.entity';
import { Semester } from '../../entities/semester.entity';
import { GetTimetableDto, WeeklyTimetableDto, TimetableResponseDto, PeriodDto, CourseInTimetableDto } from './dto/get-timetable.dto';
import { DayOfWeek, RegistrationStatus, SemesterStatus } from '../../shared/constants/enum';

@Injectable()
export class TimetableService {
    constructor(
        @InjectRepository(Registration)
        private registrationRepository: Repository<Registration>,
        
        @InjectRepository(Student)
        private studentRepository: Repository<Student>,
        
        @InjectRepository(CourseSchedule)
        private courseScheduleRepository: Repository<CourseSchedule>,
        
        @InjectRepository(Semester)
        private semesterRepository: Repository<Semester>,
    ) {}

    /**
     * Lấy thời khóa biểu theo tuần của sinh viên
     */
    async getWeeklyTimetable(getTimetableDto: GetTimetableDto): Promise<WeeklyTimetableDto> {
        // Validate student exists
        const student = await this.validateAndGetStudent(getTimetableDto.student_id);
        
        // Xác định tuần cần lấy thời khóa biểu
        const { weekStartDate, weekEndDate, currentWeek } = this.getWeekRange(
            getTimetableDto.week_start_date,
            getTimetableDto.week_end_date
        );

        // Lấy học kỳ hiện tại hoặc theo semester_id
        const semester = await this.getCurrentOrSpecifiedSemester(getTimetableDto.semester_id);

        // Lấy tất cả đăng ký đã xác nhận của sinh viên trong học kỳ
        const confirmedRegistrations = await this.getConfirmedRegistrations(
            getTimetableDto.student_id,
            semester.id
        );

        // Tạo thời khóa biểu theo từng ngày trong tuần
        const days = await this.buildWeeklySchedule(confirmedRegistrations, currentWeek, weekStartDate);

        return {
            week_start_date: weekStartDate.toISOString().split('T')[0],
            week_end_date: weekEndDate.toISOString().split('T')[0],
            semester_name: semester.name,
            student_name: student.full_name,
            student_code: student.id.toString(), // Using student ID as code for now
            days
        };
    }

    /**
     * Validate sinh viên tồn tại và lấy thông tin
     */
    private async validateAndGetStudent(studentId: number): Promise<Student> {
        const student = await this.studentRepository.findOne({
            where: { id: studentId },
            relations: ['classes', 'classes.major']
        });

        if (!student) {
            throw new NotFoundException(`Student with ID ${studentId} not found`);
        }

        return student;
    }

    /**
     * Xác định khoảng thời gian của tuần
     */
    private getWeekRange(weekStartStr?: string, weekEndStr?: string): {
        weekStartDate: Date,
        weekEndDate: Date,
        currentWeek: number
    } {
        let weekStartDate: Date;
        let weekEndDate: Date;

        if (weekStartStr) {
            weekStartDate = new Date(weekStartStr);
            weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 6);
        } else {
            // Nếu không chỉ định, lấy tuần hiện tại
            const today = new Date();
            const dayOfWeek = today.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Chủ nhật = 0, thứ 2 = 1
            
            weekStartDate = new Date(today);
            weekStartDate.setDate(today.getDate() + mondayOffset);
            weekStartDate.setHours(0, 0, 0, 0);
            
            weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6);
            weekEndDate.setHours(23, 59, 59, 999);
        }

        // Tính tuần thứ mấy trong năm (simplified calculation)
        const startOfYear = new Date(weekStartDate.getFullYear(), 0, 1);
        const currentWeek = Math.ceil(((weekStartDate.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

        return { weekStartDate, weekEndDate, currentWeek };
    }

    /**
     * Lấy học kỳ hiện tại hoặc theo ID chỉ định
     */
    private async getCurrentOrSpecifiedSemester(semesterId?: number): Promise<Semester> {
        let semester: Semester;

        if (semesterId) {
            semester = await this.semesterRepository.findOne({
                where: { id: semesterId }
            });
            if (!semester) {
                throw new NotFoundException(`Semester with ID ${semesterId} not found`);
            }
        } else {
            // Lấy học kỳ active hiện tại
            semester = await this.semesterRepository.findOne({
                where: { status: SemesterStatus.ACTIVE },
                order: { created_at: 'DESC' }
            });
            if (!semester) {
                throw new NotFoundException('No active semester found');
            }
        }

        return semester;
    }

    /**
     * Lấy danh sách đăng ký đã xác nhận của sinh viên
     */
    private async getConfirmedRegistrations(studentId: number, semesterId: number): Promise<Registration[]> {
        return await this.registrationRepository.find({
            where: {
                student_id: studentId,
                status: RegistrationStatus.CONFIRMED,
                course: {
                    semester_id: semesterId
                }
            },
            relations: [
                'course',
                'course.subject',
                'course.teacher',
                'course.schedules'
            ]
        });
    }

    /**
     * Tạo lịch học theo tuần
     */
    private async buildWeeklySchedule(
        registrations: Registration[],
        currentWeek: number,
        weekStartDate: Date
    ): Promise<TimetableResponseDto[]> {
        const days: TimetableResponseDto[] = [];

        // Tạo 7 ngày trong tuần (thứ 2 -> chủ nhật)
        for (let dayIndex = 1; dayIndex <= 7; dayIndex++) {
            const currentDate = new Date(weekStartDate);
            currentDate.setDate(weekStartDate.getDate() + (dayIndex - 1));

            const daySchedule: TimetableResponseDto = {
                day_of_week: dayIndex,
                day_name: this.getDayName(dayIndex),
                date: currentDate.toISOString().split('T')[0],
                periods: this.createEmptyPeriods()
            };

            // Điền thông tin các môn học vào các tiết tương ứng
            this.fillCoursesIntoSchedule(daySchedule, registrations, dayIndex, currentWeek);

            days.push(daySchedule);
        }

        return days;
    }

    /**
     * Tạo các tiết trống (1-12 tiết)
     */
    private createEmptyPeriods(): PeriodDto[] {
        const periods: PeriodDto[] = [];
        const periodTimes = [
            '07:00-07:50', '08:00-08:50', '09:00-09:50', '10:00-10:50',
            '11:00-11:50', '13:00-13:50', '14:00-14:50', '15:00-15:50',
            '16:00-16:50', '17:00-17:50', '18:00-18:50', '19:00-19:50'
        ];

        for (let i = 1; i <= 12; i++) {
            periods.push({
                period_number: i,
                period_time: periodTimes[i - 1] || `${6 + i}:00-${6 + i}:50`,
                course: null
            });
        }

        return periods;
    }

    /**
     * Điền thông tin môn học vào lịch
     */
    private fillCoursesIntoSchedule(
        daySchedule: TimetableResponseDto,
        registrations: Registration[],
        dayOfWeek: number,
        currentWeek: number
    ): void {
        for (const registration of registrations) {
            for (const schedule of registration.course.schedules) {
                // Kiểm tra nếu lịch học trùng với ngày và tuần hiện tại
                if (
                    schedule.day_of_week === dayOfWeek &&
                    currentWeek >= schedule.week_start &&
                    currentWeek <= schedule.week_end
                ) {
                    const courseInfo: CourseInTimetableDto = {
                        id: registration.course.id,
                        class_code: registration.course.class_code,
                        subject_name: registration.course.subject.name,
                        teacher_name: registration.course.teacher.full_name,
                        room: schedule.room || 'TBA',
                        period_start: schedule.period_start,
                        period_end: schedule.period_end,
                        week_start: schedule.week_start,
                        week_end: schedule.week_end,
                        registration_status: registration.status
                    };

                    // Điền thông tin vào các tiết tương ứng
                    for (let period = schedule.period_start; period <= schedule.period_end; period++) {
                        if (daySchedule.periods[period - 1]) {
                            daySchedule.periods[period - 1].course = courseInfo;
                        }
                    }
                }
            }
        }
    }

    /**
     * Lấy tên ngày trong tuần
     */
    private getDayName(dayOfWeek: number): string {
        const dayNames = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
        return dayNames[dayOfWeek] || 'Unknown';
    }

    /**
     * Lấy thời khóa biểu của nhiều sinh viên (cho giáo viên/quản lý)
     */
    async getMultipleStudentsTimetable(studentIds: number[], semesterId?: number): Promise<any> {
        const results = [];

        for (const studentId of studentIds) {
            try {
                const timetable = await this.getWeeklyTimetable({
                    student_id: studentId,
                    semester_id: semesterId
                });
                results.push(timetable);
            } catch (error) {
                results.push({
                    student_id: studentId,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Lấy tổng quan thời khóa biểu học kỳ
     */
    async getSemesterTimetableOverview(studentId: number, semesterId?: number): Promise<any> {
        const student = await this.validateAndGetStudent(studentId);
        const semester = await this.getCurrentOrSpecifiedSemester(semesterId);
        
        const confirmedRegistrations = await this.getConfirmedRegistrations(studentId, semester.id);

        const overview = {
            student_info: {
                id: student.id,
                name: student.full_name,
                student_code: student.id.toString(), // Using student ID as code
                class: student.classes?.class_code,
                major: student.classes?.major?.name
            },
            semester_info: {
                id: semester.id,
                name: semester.name,
                status: semester.status
            },
            total_courses: confirmedRegistrations.length,
            courses: confirmedRegistrations.map(reg => ({
                id: reg.course.id,
                class_code: reg.course.class_code,
                subject_name: reg.course.subject.name,
                teacher_name: reg.course.teacher.full_name,
                credits: reg.course.subject.credits,
                schedules: reg.course.schedules.map(schedule => ({
                    day_of_week: schedule.day_of_week,
                    day_name: this.getDayName(schedule.day_of_week),
                    period_start: schedule.period_start,
                    period_end: schedule.period_end,
                    week_start: schedule.week_start,
                    week_end: schedule.week_end,
                    room: schedule.room
                }))
            }))
        };

        return overview;
    }

    /**
     * Kiểm tra conflict lịch học
     */
    async checkScheduleConflicts(studentId: number, semesterId?: number): Promise<any[]> {
        const semester = await this.getCurrentOrSpecifiedSemester(semesterId);
        const confirmedRegistrations = await this.getConfirmedRegistrations(studentId, semester.id);
        
        const conflicts = [];
        
        for (let i = 0; i < confirmedRegistrations.length; i++) {
            for (let j = i + 1; j < confirmedRegistrations.length; j++) {
                const course1 = confirmedRegistrations[i].course;
                const course2 = confirmedRegistrations[j].course;
                
                for (const schedule1 of course1.schedules) {
                    for (const schedule2 of course2.schedules) {
                        if (this.hasScheduleConflict(schedule1, schedule2)) {
                            conflicts.push({
                                course1: {
                                    id: course1.id,
                                    class_code: course1.class_code,
                                    subject_name: course1.subject.name
                                },
                                course2: {
                                    id: course2.id,
                                    class_code: course2.class_code,
                                    subject_name: course2.subject.name
                                },
                                conflict_details: {
                                    day_of_week: schedule1.day_of_week,
                                    day_name: this.getDayName(schedule1.day_of_week),
                                    period_start: Math.max(schedule1.period_start, schedule2.period_start),
                                    period_end: Math.min(schedule1.period_end, schedule2.period_end),
                                    week_overlap: {
                                        start: Math.max(schedule1.week_start, schedule2.week_start),
                                        end: Math.min(schedule1.week_end, schedule2.week_end)
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }
        
        return conflicts;
    }

    /**
     * Kiểm tra 2 lịch học có bị conflict không
     */
    private hasScheduleConflict(schedule1: CourseSchedule, schedule2: CourseSchedule): boolean {
        // Kiểm tra cùng ngày trong tuần
        if (schedule1.day_of_week !== schedule2.day_of_week) {
            return false;
        }

        // Kiểm tra trùng thời gian (tiết học)
        const periodsOverlap = !(
            schedule1.period_end < schedule2.period_start || 
            schedule2.period_end < schedule1.period_start
        );

        // Kiểm tra trùng tuần
        const weeksOverlap = !(
            schedule1.week_end < schedule2.week_start || 
            schedule2.week_end < schedule1.week_start
        );

        return periodsOverlap && weeksOverlap;
    }

    /**
     * Lấy thống kê thời khóa biểu
     */
    async getTimetableStatistics(studentId: number, semesterId?: number): Promise<any> {
        const semester = await this.getCurrentOrSpecifiedSemester(semesterId);
        const confirmedRegistrations = await this.getConfirmedRegistrations(studentId, semester.id);
        
        let totalPeriods = 0;
        let totalCredits = 0;
        const dayStatistics = {};
        const periodStatistics = {};
        
        // Khởi tạo thống kê theo ngày
        for (let day = 1; day <= 7; day++) {
            dayStatistics[day] = {
                day_name: this.getDayName(day),
                courses_count: 0,
                periods_count: 0
            };
        }

        // Khởi tạo thống kê theo tiết
        for (let period = 1; period <= 12; period++) {
            periodStatistics[period] = {
                period_time: this.getPeriodTime(period),
                courses_count: 0,
                days_count: 0
            };
        }

        for (const registration of confirmedRegistrations) {
            totalCredits += registration.course.subject.credits;
            
            for (const schedule of registration.course.schedules) {
                const periodsInSchedule = schedule.period_end - schedule.period_start + 1;
                totalPeriods += periodsInSchedule;
                
                // Thống kê theo ngày
                dayStatistics[schedule.day_of_week].courses_count++;
                dayStatistics[schedule.day_of_week].periods_count += periodsInSchedule;
                
                // Thống kê theo tiết
                for (let p = schedule.period_start; p <= schedule.period_end; p++) {
                    periodStatistics[p].courses_count++;
                    periodStatistics[p].days_count++;
                }
            }
        }

        return {
            student_id: studentId,
            semester_id: semester.id,
            total_courses: confirmedRegistrations.length,
            total_credits: totalCredits,
            total_periods: totalPeriods,
            average_periods_per_day: Number((totalPeriods / 7).toFixed(2)),
            day_statistics: Object.values(dayStatistics),
            period_statistics: Object.values(periodStatistics),
            busiest_day: this.getBusiestDay(dayStatistics),
            free_periods: this.getFreePeriods(periodStatistics)
        };
    }

    /**
     * Lấy thời gian của tiết học
     */
    private getPeriodTime(period: number): string {
        const periodTimes = [
            '07:00-07:50', '08:00-08:50', '09:00-09:50', '10:00-10:50',
            '11:00-11:50', '13:00-13:50', '14:00-14:50', '15:00-15:50',
            '16:00-16:50', '17:00-17:50', '18:00-18:50', '19:00-19:50'
        ];
        return periodTimes[period - 1] || `${6 + period}:00-${6 + period}:50`;
    }

    /**
     * Tìm ngày bận nhất
     */
    private getBusiestDay(dayStatistics: any): any {
        let busiestDay = null;
        let maxPeriods = 0;

        for (const day in dayStatistics) {
            if (dayStatistics[day].periods_count > maxPeriods) {
                maxPeriods = dayStatistics[day].periods_count;
                busiestDay = {
                    day: parseInt(day),
                    day_name: dayStatistics[day].day_name,
                    periods_count: maxPeriods,
                    courses_count: dayStatistics[day].courses_count
                };
            }
        }

        return busiestDay;
    }

    /**
     * Lấy các tiết trống
     */
    private getFreePeriods(periodStatistics: any): number[] {
        const freePeriods = [];
        for (const period in periodStatistics) {
            if (periodStatistics[period].courses_count === 0) {
                freePeriods.push(parseInt(period));
            }
        }
        return freePeriods;
    }

    /**
     * Export thời khóa biểu theo format
     */
    async exportTimetable(studentId: number, format: string = 'json', semesterId?: number, weekStartDate?: string): Promise<any> {
        const dto: GetTimetableDto = {
            student_id: studentId,
            semester_id: semesterId,
            week_start_date: weekStartDate
        };

        const timetableData = await this.getWeeklyTimetable(dto);

        switch (format.toLowerCase()) {
            case 'json':
                return {
                    format: 'json',
                    data: timetableData,
                    exported_at: new Date().toISOString()
                };

            case 'csv':
                return this.exportToCSV(timetableData);

            case 'pdf':
                // Trả về structure data cho PDF generation (frontend sẽ handle)
                return this.exportToPDFData(timetableData);

            default:
                throw new BadRequestException(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Export to CSV format
     */
    private exportToCSV(timetableData: any): any {
        const csvRows = [];
        
        // Header
        csvRows.push([
            'Ngày',
            'Thứ',
            'Tiết',
            'Thời gian',
            'Mã lớp',
            'Môn học',
            'Giáo viên',
            'Phòng học'
        ]);

        // Data rows
        for (const day of timetableData.days) {
            for (const period of day.periods) {
                if (period.course) {
                    csvRows.push([
                        day.date,
                        day.day_name,
                        period.period_number,
                        period.period_time,
                        period.course.class_code,
                        period.course.subject_name,
                        period.course.teacher_name,
                        period.course.room
                    ]);
                }
            }
        }

        return {
            format: 'csv',
            filename: `timetable_${timetableData.student_code}_${timetableData.week_start_date}.csv`,
            headers: csvRows[0],
            data: csvRows.slice(1),
            csv_string: csvRows.map(row => row.join(',')).join('\n'),
            exported_at: new Date().toISOString()
        };
    }

    /**
     * Export data structure for PDF
     */
    private exportToPDFData(timetableData: any): any {
        // Tạo ma trận thời khóa biểu cho PDF
        const schedule_matrix = [];
        
        // Header với các ngày trong tuần
        const header = ['Tiết/Thời gian'];
        timetableData.days.forEach(day => {
            header.push(`${day.day_name}\n${day.date}`);
        });
        schedule_matrix.push(header);

        // Các hàng tiết học
        for (let period = 1; period <= 12; period++) {
            const row = [`Tiết ${period}\n${this.getPeriodTime(period)}`];
            
            timetableData.days.forEach(day => {
                const periodData = day.periods.find(p => p.period_number === period);
                if (periodData && periodData.course) {
                    row.push(
                        `${periodData.course.class_code}\n` +
                        `${periodData.course.subject_name}\n` +
                        `${periodData.course.teacher_name}\n` +
                        `Phòng: ${periodData.course.room}`
                    );
                } else {
                    row.push('');
                }
            });
            
            schedule_matrix.push(row);
        }

        return {
            format: 'pdf',
            metadata: {
                title: 'THỜI KHÓA BIỂU',
                student_name: timetableData.student_name,
                student_code: timetableData.student_code,
                semester: timetableData.semester_name,
                week_range: `${timetableData.week_start_date} - ${timetableData.week_end_date}`,
                generated_at: new Date().toLocaleString('vi-VN')
            },
            schedule_matrix: schedule_matrix,
            styling: {
                header_style: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center'
                },
                table_style: {
                    border: 1,
                    cellPadding: 5,
                    fontSize: 10
                }
            },
            exported_at: new Date().toISOString()
        };
    }
}