import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Curriculum } from './curriculum.entity';
import { CurriculumItem } from './curriculum-item.entity';

@Entity('curriculums_session')
export class CurriculumSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'curriculum_id' })
  curriculumId: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'total_items' })
  totalItems: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Curriculum, curriculum => curriculum.sessions)
  @JoinColumn({ name: 'curriculum_id' })
  curriculum: Curriculum;

  @OneToMany(() => CurriculumItem, item => item.session)
  items: CurriculumItem[];
} 