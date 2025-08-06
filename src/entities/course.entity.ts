import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Subject } from './subject.entity';
import { Semester } from './semester.entity';
import { Teacher } from '../modules/teacher/entities/teacher.entity';
import { CourseSchedule } from './course-schedule.entity';
import { Registration } from './registration.entity';

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subject_id: number;

    @Column()
    semester_id: number;

    @Column()
    teacher_id: number;

    @Column({ length: 20, unique: true })
    class_code: string;

    @Column({ type: 'int', default: 50 })
    max_students: number;

    @Column({ type: 'int', default: 0 })
    current_students: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Subject, subject => subject.id)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @ManyToOne(() => Semester, semester => semester.id)
    @JoinColumn({ name: 'semester_id' })
    semester: Semester;

    @ManyToOne(() => Teacher, teacher => teacher.id)
    @JoinColumn({ name: 'teacher_id' })
    teacher: Teacher;

    @OneToMany(() => CourseSchedule, schedule => schedule.course)
    schedules: CourseSchedule[];

    @OneToMany(() => Registration, registration => registration.course)
    registrations: Registration[];
}