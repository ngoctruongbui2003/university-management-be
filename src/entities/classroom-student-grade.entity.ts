import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('classroom_student_grades')
export class ClassroomStudentGrade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'classroom_id' })
    classroomId: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'qt1_grade', type: 'decimal', precision: 5, scale: 2, nullable: true })
    qt1Grade: number;

    @Column({ name: 'qt2_grade', type: 'decimal', precision: 5, scale: 2, nullable: true })
    qt2Grade: number;

    @Column({ name: 'midterm_grade', type: 'decimal', precision: 5, scale: 2, nullable: true })
    midtermGrade: number;

    @Column({ name: 'final_grade', type: 'decimal', precision: 5, scale: 2, nullable: true })
    finalGrade: number;

    @Column({ name: 'reason', type: 'text', nullable: true })
    reason: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
