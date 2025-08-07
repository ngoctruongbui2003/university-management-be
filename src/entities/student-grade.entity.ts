import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Classroom } from './classroom.entity';
import { User } from './user.entity';
import { GradeType } from './grade-type.entity';

@Entity('student_grades')
@Index(['classroom_id', 'student_id', 'grade_type_id'], { unique: true }) // Prevent duplicate grades
export class StudentGrade {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    classroom_id: number;

    @Column()
    student_id: number;

    @Column()
    grade_type_id: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    score: number; // 0.00 - 10.00

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.00 })
    max_score: number; // Usually 10.00

    @Column({ type: 'text', nullable: true })
    comments: string;

    @Column()
    graded_by: number; // Teacher ID

    @Column({ type: 'datetime' })
    graded_at: Date;

    @Column({ type: 'boolean', default: false })
    is_final: boolean; // true nếu là điểm cuối kỳ đã được finalize

    @Column({ type: 'boolean', default: true })
    is_published: boolean; // sinh viên có thấy điểm này không

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Classroom, classroom => classroom.id)
    @JoinColumn({ name: 'classroom_id' })
    classroom: Classroom;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'student_id' })
    student: User;

    @ManyToOne(() => GradeType, gradeType => gradeType.id)
    @JoinColumn({ name: 'grade_type_id' })
    gradeType: GradeType;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'graded_by' })
    gradedBy: User;
}