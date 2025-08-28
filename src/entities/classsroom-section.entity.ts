import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('classroom_sections')
export class ClassroomSection {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'classroom_id', nullable: true })
    classroomId: number;

    @Column({ name: 'class_section_id', nullable: true })
    classSectionId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    material: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    type: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    deadline: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'text', nullable: true })
    files: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
