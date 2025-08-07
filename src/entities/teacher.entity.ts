import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Faculty } from './faculty.entity';

@Entity('teachers')
export class Teacher {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    full_name: string;

    @Column({ length: 100 })
    email: string;

    @Column({ length: 100 })
    phone: string;

    @Column({ length: 100 })
    address: string;

    @Column({ type: 'tinyint', comment: '0: Nam, 1: Nữ, 2: Khác' })
    gender: number;

    @Column()
    birth_date: Date;

    @Column({ length: 100 })
    qualification: string;

    @Column({ length: 100 })
    department: string;

    @Column()
    faculty_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @OneToOne(() => User, user => user.id)
    user: User;

    @ManyToOne(() => Faculty, faculty => faculty.id)
    @JoinColumn({ name: 'faculty_id' })
    faculty: Faculty;
}
