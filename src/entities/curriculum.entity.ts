import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CurriculumSession } from './curriculum-session.entity';

export enum CurriculumStatus {
  ACTIVE = 'Active',
  ARCHIVED = 'Archived'
}

@Entity('curriculums')
export class Curriculum {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'effective_year' })
  effectiveYear: number;

  @Column({
    type: 'enum',
    enum: CurriculumStatus,
    default: CurriculumStatus.ACTIVE
  })
  status: CurriculumStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => CurriculumSession, session => session.curriculum)
  sessions: CurriculumSession[];
} 