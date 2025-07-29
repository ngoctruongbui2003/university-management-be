import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Faculty } from './faculty.entity';

@Entity('majors')
export class Major {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ length: 20 })
    code: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column()
    faculty_id: number;

    @ManyToOne(() => Faculty)
    @JoinColumn({ name: 'faculty_id' })
    faculty: Faculty;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 