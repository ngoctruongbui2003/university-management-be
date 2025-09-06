import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Semester } from './semester.entity';
import { CourseRegistrationStatus } from '../shared/constants/enum';

@Entity('course_registrations')
export class CourseRegistration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    semester_id: number;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({ 
        type: 'enum', 
        enum: CourseRegistrationStatus, 
        default: CourseRegistrationStatus.OPEN 
    })
    status: CourseRegistrationStatus;

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

    @OneToMany('CourseRegistrationClasses', 'courseRegistration')
    courseRegistrationClasses: any[];

    @OneToMany('CourseRegistrationSubject', 'courseRegistration')
    courseRegistrationSubjects: any[];
}
