import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GradingFormula } from './grading-formula.entity';

export enum GradeTypeEnum {
  QT1 = 'QT1',
  QT2 = 'QT2',
  GK = 'GK',
  CK = 'CK'
}

@Entity('grade_types')
export class GradeType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grading_formula_id' })
  gradingFormulaId: number;

  @Column({
    type: 'enum',
    enum: GradeTypeEnum
  })
  gradeType: GradeTypeEnum;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => GradingFormula, gradingFormula => gradingFormula.gradeTypes)
  @JoinColumn({ name: 'grading_formula_id' })
  gradingFormula: GradingFormula;
} 