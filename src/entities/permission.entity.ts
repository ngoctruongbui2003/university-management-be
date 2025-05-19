import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string; // read:student, write:course

    @Column({ nullable: true })
    description: string;

    @ManyToMany(() => Role, role => role.permissions)
    roles: Role[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}