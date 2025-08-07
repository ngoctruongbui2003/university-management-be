import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';

@Entity('classrooms')
export class Classroom {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    course_id: number;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 20, unique: true })
    class_code: string; // Auto-generated: CS101-2024-01

    @Column({ length: 10, unique: true })
    invite_code: string; // Random: ABC123XYZ

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Course, course => course.id)
    @JoinColumn({ name: 'course_id' })
    course: Course;
}