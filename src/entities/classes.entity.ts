import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Major } from './major.entity';
import { Curriculum } from './curriculum.entity';
import { Student } from './student.entity';

@Entity('classes')
export class Classes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    class_code: string;

    @Column({ length: 100 })
    description: string;

    @Column()
    academic_year: number;

    @Column()
    major_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Major, major => major.classes)
    @JoinColumn({ name: 'major_id' })
    major: Major;

    @OneToMany(() => Curriculum, curriculum => curriculum.id)
    @JoinColumn({ name: 'curriculum_id' })
    curriculum: Curriculum[];

    @OneToMany(() => Student, student => student.classes)
    students: Student[];
}