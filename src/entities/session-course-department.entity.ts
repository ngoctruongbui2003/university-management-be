import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SessionCourse } from './session-course.entity';
import { Faculty } from './faculty.entity';

@Entity('session_course_departments')
export class SessionCourseDepartment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    session_course_id: number;

    @Column()
    faculty_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => SessionCourse, sessionCourse => sessionCourse.allowedDepartments)
    @JoinColumn({ name: 'session_course_id' })
    sessionCourse: SessionCourse;

    @ManyToOne(() => Faculty, faculty => faculty.id)
    @JoinColumn({ name: 'faculty_id' })
    faculty: Faculty;
}