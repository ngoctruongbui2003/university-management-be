import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';
import { DayOfWeek } from '../shared/constants/enum';

@Entity('course_schedules')
export class CourseSchedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    course_id: number;

    @Column({ 
        type: 'tinyint',
        comment: '1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday, 7: Sunday'
    })
    day_of_week: DayOfWeek;

    @Column({ type: 'tinyint', comment: 'Tiết bắt đầu (1-12)' })
    period_start: number;

    @Column({ type: 'tinyint', comment: 'Tiết kết thúc (1-12)' })
    period_end: number;

    @Column({ type: 'tinyint', comment: 'Tuần bắt đầu (1-20)' })
    week_start: number;

    @Column({ type: 'tinyint', comment: 'Tuần kết thúc (1-20)' })
    week_end: number;

    @Column({ length: 50, nullable: true })
    room: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Course, course => course.schedules)
    @JoinColumn({ name: 'course_id' })
    course: Course;
}