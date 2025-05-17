import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, UpdateDateColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string; // Ví dụ: ADMIN, TEACHER, STUDENT

    @OneToMany(() => User, user => user.role)
    users: User[];

    @ManyToMany(() => Permission, { eager: true })
    @JoinTable()
    permissions: Permission[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}