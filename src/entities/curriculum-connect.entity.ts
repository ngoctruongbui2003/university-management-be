import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Curriculum } from './curriculum.entity';
import { CurriculumSession } from './curriculum-session.entity';
import { CurriculumItem } from './curriculum-item.entity';

@Entity('curriculums_connect')
export class CurriculumConnect {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'curriculum_id' })
    curriculumId: number;

    @Column({ name: 'curriculum_session_id' })
    curriculumSessionId: number;

    // ---------------Relationships---------------

    @ManyToOne(() => Curriculum, curriculum => curriculum.connects)
    @JoinColumn({ name: 'curriculum_id' })
    curriculum: Curriculum;

    @ManyToOne(() => CurriculumSession, curriculumSession => curriculumSession.connects)
    @JoinColumn({ name: 'curriculum_session_id' })
    curriculumSession: CurriculumSession;

    @OneToMany(() => CurriculumItem, item => item.connect)
    items: CurriculumItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 