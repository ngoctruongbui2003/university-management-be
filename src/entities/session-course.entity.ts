import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { RegistrationSession } from './registration-session.entity';
import { Course } from './course.entity';
import { SessionCourseDepartment } from './session-course-department.entity';

@Entity('session_courses')
export class SessionCourse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    registration_session_id: number;

    @Column()
    course_id: number;

    @Column({ type: 'boolean', default: true })
    is_available: boolean;

    @Column({ type: 'int', default: 0 })
    priority: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => RegistrationSession, session => session.sessionCourses)
    @JoinColumn({ name: 'registration_session_id' })
    registrationSession: RegistrationSession;

    @ManyToOne(() => Course, course => course.id)
    @JoinColumn({ name: 'course_id' })
    course: Course;

    @OneToMany(() => SessionCourseDepartment, dept => dept.sessionCourse)
    allowedDepartments: SessionCourseDepartment[];
}