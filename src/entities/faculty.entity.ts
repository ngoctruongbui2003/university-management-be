import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Major } from './major.entity';

@Entity('faculties')
export class Faculty {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100, unique: true })
    name: string;

    @Column({ length: 100, nullable: true })
    dean: string;

    @Column({ length: 100, unique: true })
    code: string;

    @Column({ type: 'text', nullable: true })
    contact_info: string;

    @OneToMany(() => Major, major => major.faculty)
    majors: Major[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 