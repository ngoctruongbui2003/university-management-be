import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CurriculumItem } from './curriculum-item.entity';
import { Subject } from './subject.entity';

@Entity('subject_curriculum_items')
export class SubjectCurriculumItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'curriculum_item_id' })
  curriculumItemId: number;

  @Column({ name: 'subject_id' })
  subjectId: number;

  @Column({ name: 'is_required', default: true })
  isRequired: boolean;

  @Column()
  credits: number;

  @Column({ name: 'prerequisite_id', nullable: true })
  prerequisiteId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => CurriculumItem, item => item.subjectItems)
  @JoinColumn({ name: 'curriculum_item_id' })
  curriculumItem: CurriculumItem;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'prerequisite_id' })
  prerequisite: Subject;
} 