import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CourseRegistrationSubject } from './course-registration-subject.entity';

@Entity('course_registration_schedules')
export class CourseRegistrationSchedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    course_registration_subject_id: number;

    @Column()
    sections: number;

    @Column({ type: 'text' })
    schedule: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => CourseRegistrationSubject, courseRegistrationSubject => courseRegistrationSubject.courseRegistrationSchedules)
    @JoinColumn({ name: 'course_registration_subject_id' })
    courseRegistrationSubject: CourseRegistrationSubject;
}
