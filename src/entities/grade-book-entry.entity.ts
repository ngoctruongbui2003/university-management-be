import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Classroom } from './classroom.entity';
import { GradeType } from './grade-type.entity';
import { User } from './user.entity';
import { StudentGrade } from './student-grade.entity';

@Entity('grade_book_entries')
export class GradeBookEntry {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    classroom_id: number;

    @Column()
    grade_type_id: number;

    @Column({ length: 300 })
    title: string; // "Kiểm tra giữa kỳ lần 1", "Bài tập về nhà tuần 3"

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.00 })
    max_score: number;

    @Column()
    created_by: number; // Teacher ID

    @Column({ type: 'datetime', nullable: true })
    due_date: Date; // Deadline nộp bài (optional)

    @Column({ type: 'boolean', default: false })
    is_published: boolean; // Điểm có được public cho sinh viên xem không

    @Column({ type: 'boolean', default: false })
    is_finalized: boolean; // Đã hoàn tất chấm điểm, không thể sửa

    @Column({ type: 'int', default: 0 })
    total_students: number; // Cached count

    @Column({ type: 'int', default: 0 })
    graded_students: number; // Cached count

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Classroom, classroom => classroom.id)
    @JoinColumn({ name: 'classroom_id' })
    classroom: Classroom;

    @ManyToOne(() => GradeType, gradeType => gradeType.id)
    @JoinColumn({ name: 'grade_type_id' })
    gradeType: GradeType;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'created_by' })
    createdBy: User;

    @OneToMany(() => StudentGrade, grade => grade.id)
    studentGrades: StudentGrade[];
}