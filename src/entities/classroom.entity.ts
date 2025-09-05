import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { User } from './user.entity';
import { Subject } from './subject.entity';
import { ClassroomMember } from './classroom-member.entity';

@Entity('classrooms')
export class Classroom {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int', nullable: true })
    credits: number;

    @Column({ type: 'int', nullable: true })
    sections: number;

    @Column({ length: 20, nullable: true })
    schedule: string;

    @Column({ length: 20, nullable: true })
    location: string;

    @Column({ type: 'int', nullable: true })
    enrolled: number;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ length: 20, nullable: true })
    semester: string;

    @Column({ length: 20, nullable: true, default: 'main' })
    type: string;

    @Column({ length: 20, nullable: true })
    instructor: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Subject, subject => subject.id)
    @JoinColumn({ name: 'subject_id' })
    subject: Subject;

    @OneToMany(() => ClassroomMember, member => member.classroom)
    members: ClassroomMember[];
}