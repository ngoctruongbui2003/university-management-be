import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Semester } from './semester.entity';
import { SessionCourse } from './session-course.entity';

@Entity('registration_sessions')
export class RegistrationSession {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    semester_id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'datetime' })
    start_date: Date;

    @Column({ type: 'datetime' })
    end_date: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Semester, semester => semester.id)
    @JoinColumn({ name: 'semester_id' })
    semester: Semester;

    @OneToMany(() => SessionCourse, sessionCourse => sessionCourse.registrationSession)
    sessionCourses: SessionCourse[];
}