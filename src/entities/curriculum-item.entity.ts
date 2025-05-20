import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CurriculumSession } from './curriculum-session.entity';
import { SubjectCurriculumItem } from './subject-curriculum-item.entity';

@Entity('curriculum_items')
export class CurriculumItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'curriculum_type_id' })
  curriculumTypeId: number;

  @Column({ name: 'item_number' })
  itemNumber: number;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => CurriculumSession, session => session.items)
  @JoinColumn({ name: 'curriculum_type_id' })
  session: CurriculumSession;

  @OneToMany(() => SubjectCurriculumItem, subjectItem => subjectItem.curriculumItem)
  subjectItems: SubjectCurriculumItem[];
} 