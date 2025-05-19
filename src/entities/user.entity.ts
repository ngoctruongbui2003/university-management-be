import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entity';


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true, nullable: false })
    username: string;

    @Column({ length: 255, nullable: false })
    password: string;

    @ManyToOne(() => Role, role => role.users, { nullable: false })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ length: 100, nullable: false })
    full_name: string;

    @Column({ length: 100, unique: true, nullable: true })
    email: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
