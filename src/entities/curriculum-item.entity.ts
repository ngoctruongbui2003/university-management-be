import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CurriculumSession } from './curriculum-session.entity';
import { SubjectCurriculumItem } from './subject-curriculum-item.entity';
import { CurriculumConnect } from './curriculum-connect.entity';

@Entity('curriculum_items')
export class CurriculumItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'curriculum_connect_id' })
  curriculumConnectId: number;

  @Column({ length: 50 })
  name: string;

  @Column({ name: 'item_sequence' })
  itemSequence: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---------------Relationships---------------

  @ManyToOne(() => CurriculumConnect, connect => connect.items)
  @JoinColumn({ name: 'curriculum_connect_id' })
  connect: CurriculumConnect;

  @OneToMany(() => SubjectCurriculumItem, subjectItem => subjectItem.curriculumItem)
  subjectItems: SubjectCurriculumItem[];
} 