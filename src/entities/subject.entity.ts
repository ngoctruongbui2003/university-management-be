import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { GradingFormula } from './grading-formula.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  code: string;

  @Column()
  credits: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'grading_formula_id' })
  gradingFormulaId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ---------------Relationships---------------

  @ManyToOne(() => GradingFormula)
  @JoinColumn({ name: 'grading_formula_id' })
  gradingFormula: GradingFormula;
} 