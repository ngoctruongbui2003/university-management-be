import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GradingFormula } from './grading-formula.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column()
  credits: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'max_students', default: 50 })
  maxStudents: number;

  @Column({ name: 'grading_formula_id' })
  gradingFormulaId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => GradingFormula)
  @JoinColumn({ name: 'grading_formula_id' })
  gradingFormula: GradingFormula;
} 