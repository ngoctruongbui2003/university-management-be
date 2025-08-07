import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Classroom } from './classroom.entity';
import { User } from './user.entity';

export enum PostType {
    ANNOUNCEMENT = 'announcement',
    MATERIAL = 'material', 
    IMPORTANT = 'important'
}

export interface FileAttachment {
    filename: string;
    original_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
}

@Entity('classroom_posts')
export class ClassroomPost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    classroom_id: number;

    @Column({ length: 300 })
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ 
        type: 'enum', 
        enum: PostType, 
        default: PostType.ANNOUNCEMENT 
    })
    post_type: PostType;

    @Column({ type: 'json', nullable: true })
    attachments: FileAttachment[];

    @Column()
    created_by: number;

    @Column({ type: 'boolean', default: false })
    is_pinned: boolean;

    @Column({ type: 'int', default: 0 })
    view_count: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => Classroom, classroom => classroom.id)
    @JoinColumn({ name: 'classroom_id' })
    classroom: Classroom;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'created_by' })
    creator: User;
}