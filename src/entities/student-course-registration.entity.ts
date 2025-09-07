import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { CourseRegistrationSubject } from './course-registration-subject.entity';
import { StudentRegistrationStatus } from '../shared/constants/enum';

@Entity('student_course_registrations')
export class StudentCourseRegistration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    course_registration_subject_id: number;

    @Column({ 
        type: 'enum', 
        enum: StudentRegistrationStatus, 
        default: StudentRegistrationStatus.APPROVED 
    })
    status: StudentRegistrationStatus;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    registered_at: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'text', nullable: true })
    rejection_reason: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => CourseRegistrationSubject, courseRegistrationSubject => courseRegistrationSubject.id)
    @JoinColumn({ name: 'course_registration_subject_id' })
    courseRegistrationSubject: CourseRegistrationSubject;
}
