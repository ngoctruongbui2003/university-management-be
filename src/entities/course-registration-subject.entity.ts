import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { CourseRegistration } from './course-registration.entity';
import { Subject } from './subject.entity';
import { Semester } from './semester.entity';
import { CourseRegistrationSchedule } from './course-registration-schedule.entity';
import { StudentCourseRegistration } from './student-course-registration.entity';

@Entity('course_registration_subjects')
export class CourseRegistrationSubject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    course_registration_id: number;

    @Column()
    subject_id: number;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column()
    max_student: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 255, nullable: true })
    location: string;

    @Column()
    semester_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => CourseRegistration, courseRegistration => courseRegistration.courseRegistrationSubjects)
    @JoinColumn({ name: 'course_registration_id' })
    courseRegistration: CourseRegistration;

    @ManyToOne(() => Subject, subject => subject.id)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @ManyToOne(() => Semester, semester => semester.id)
    @JoinColumn({ name: 'semester_id' })
    semester: Semester;

    @OneToMany(() => CourseRegistrationSchedule, courseRegistrationSchedule => courseRegistrationSchedule.courseRegistrationSubject, {
        onDelete: 'CASCADE'
    })
    courseRegistrationSchedules: CourseRegistrationSchedule[];

    @OneToMany(() => StudentCourseRegistration, studentCourseRegistration => studentCourseRegistration.courseRegistrationSubject)
    studentCourseRegistrations: StudentCourseRegistration[];
}
