import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AcademicYearStatus {
    ACTIVE = 'Active',
    CLOSED = 'Closed'
}

@Entity('academic_years')
export class AcademicYear {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    year: number;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column({
        type: 'enum',
        enum: AcademicYearStatus,
        default: AcademicYearStatus.ACTIVE
    })
    status: AcademicYearStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 