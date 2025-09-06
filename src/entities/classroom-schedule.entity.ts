import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Classroom } from './classroom.entity';

@Entity('classroom_schedules')
export class ClassroomSchedule {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    sections: number;

    @Column({ length: 20, nullable: true })
    schedule: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Classroom, classroom => classroom.schedules)
    @JoinColumn({ name: 'classroom_id' })
    classroom: Classroom;
}
