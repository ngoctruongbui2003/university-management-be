import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Classroom } from './classroom.entity';
import { User } from './user.entity';

export enum ClassroomRole {
    TEACHER = 'teacher',
    STUDENT = 'student',
    ASSISTANT = 'assistant'
}

@Entity('classroom_members')
export class ClassroomMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    classroom_id: number;

    @Column()
    user_id: number;

    @Column({ 
        type: 'enum', 
        enum: ClassroomRole, 
        default: ClassroomRole.STUDENT 
    })
    role: ClassroomRole;

    @CreateDateColumn()
    joined_at: Date;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    // ---------------Relationships---------------
    @ManyToOne(() => Classroom, classroom => classroom.id)
    @JoinColumn({ name: 'classroom_id' })
    classroom: Classroom;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;
}