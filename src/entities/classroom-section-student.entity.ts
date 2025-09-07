import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ClassroomSection } from './classsroom-section.entity';
import { User } from './user.entity';

@Entity('classroom_section_students')
export class ClassroomSectionStudent {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'classroom_section_id' })
    classroomSectionId: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ type: 'timestamp', nullable: true, name: 'submitted_at' })
    submittedAt: Date;

    @Column({ type: 'text', nullable: true })
    files: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => ClassroomSection)
    @JoinColumn({ name: 'classroom_section_id' })
    classroomSection: ClassroomSection;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
