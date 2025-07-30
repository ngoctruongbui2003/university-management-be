import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CurriculumConnect } from './curriculum-connect.entity';

@Entity('curriculums_session')
export class CurriculumSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---------------Relationships---------------

  @OneToMany(() => CurriculumConnect, connect => connect.curriculumSession)
  connects: CurriculumConnect[];
} 