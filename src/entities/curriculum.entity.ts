import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CurriculumSession } from './curriculum-session.entity';
import { CurriculumConnect } from './curriculum-connect.entity';

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

  @Column({ name: 'academic_year', nullable: true })
  academicYear: number;

  @Column({
    type: 'enum',
    enum: CurriculumStatus,
    default: CurriculumStatus.ACTIVE
  })
  status: CurriculumStatus;

  @Column({ name: 'major_id', nullable: true })
  majorId: number;

  @Column({ name: 'total_credits', nullable: true })
  totalCredits: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---------------Relationships---------------

  @OneToMany(() => CurriculumConnect, connect => connect.curriculum)
  connects: CurriculumConnect[];
} 