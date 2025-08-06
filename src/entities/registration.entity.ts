import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';
import { RegistrationSession } from './registration-session.entity';
import { RegistrationStatus } from '../shared/constants/enum';

@Entity('registrations')
export class Registration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    student_id: number;

    @Column()
    course_id: number;

    @Column()
    registration_session_id: number;

    @Column({ 
        type: 'enum', 
        enum: RegistrationStatus, 
        default: RegistrationStatus.PENDING 
    })
    status: RegistrationStatus;

    @Column({ type: 'datetime' })
    registered_at: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Student, student => student.id)
    @JoinColumn({ name: 'student_id' })
    student: Student;

    @ManyToOne(() => Course, course => course.registrations)
    @JoinColumn({ name: 'course_id' })
    course: Course;

    @ManyToOne(() => RegistrationSession, session => session.id)
    @JoinColumn({ name: 'registration_session_id' })
    registrationSession: RegistrationSession;
}