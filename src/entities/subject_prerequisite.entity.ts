import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { SubjectCurriculumItem } from './subject-curriculum-item.entity';

@Entity('subject_prerequisite')
export class SubjectPrerequisite {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'subject_curriculum_item_id' })
    subjectCurriculumItemId: number;

    @Column({ name: 'prerequisite_subject_curriculum_item_id' })
    prerequisiteSubjectCurriculumItemId: number;

    @ManyToOne(() => SubjectCurriculumItem)
    @JoinColumn({ name: 'subject_curriculum_item_id' })
    subjectCurriculumItem: SubjectCurriculumItem;

    @ManyToOne(() => SubjectCurriculumItem)
    @JoinColumn({ name: 'prerequisite_subject_curriculum_item_id' })
    prerequisiteSubjectCurriculumItem: SubjectCurriculumItem;
}