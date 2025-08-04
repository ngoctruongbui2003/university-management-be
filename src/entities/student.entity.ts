import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Classes } from './classes.entity';

@Entity('students')
export class Student {
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

    @Column({ length: 100 })
    gender: string;

    @Column({ length: 100 })
    birth_date: Date;

    // ---------------Relationships---------------
    @OneToOne(() => User, user => user.id)
    user: User;

    @ManyToOne(() => Classes, classes => classes.id)
    @JoinColumn({ name: 'class_id' })
    classes: Classes;
}