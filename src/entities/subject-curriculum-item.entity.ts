import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { CurriculumItem } from './curriculum-item.entity';
import { Subject } from './subject.entity';
import { SubjectPrerequisite } from './subject_prerequisite.entity';

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

  @Column({ name: 'min_credits' })
  min_credits: number;

  @Column({ name: 'item_sequence' })
  itemSequence: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---------------Relationships---------------

  @ManyToOne(() => CurriculumItem, item => item.subjectItems)
  @JoinColumn({ name: 'curriculum_item_id' })
  curriculumItem: CurriculumItem;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @OneToMany(() => SubjectPrerequisite, prerequisite => prerequisite.subjectCurriculumItem)
  @JoinColumn({ name: 'subject_curriculum_item_id' })
  prerequisite: SubjectPrerequisite[];

  @OneToMany(() => SubjectPrerequisite, prerequisite => prerequisite.prerequisiteSubjectCurriculumItem)
  @JoinColumn({ name: 'prerequisite_subject_curriculum_item_id' })
  prerequisiteSubjectCurriculumItem: SubjectPrerequisite[];
} 