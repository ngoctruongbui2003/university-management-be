import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AcademicYear } from './academic-year.entity';
import { SemesterStatus } from '../shared/constants/enum';

@Entity('semesters')
export class Semester {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    academic_year_id: number;

    @Column({ length: 50, unique: true })
    name: string;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({ 
        type: 'enum', 
        enum: SemesterStatus, 
        default: SemesterStatus.ACTIVE 
    })
    status: SemesterStatus;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => AcademicYear, academicYear => academicYear.id)
    @JoinColumn({ name: 'academic_year_id' })
    academicYear: AcademicYear;
}