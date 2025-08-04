import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Faculty } from './faculty.entity';
import { Classes } from './classes.entity';

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

    // ---------------Relationships---------------
    @OneToMany(() => Classes, classes => classes.major)
    classes: Classes[];
} 