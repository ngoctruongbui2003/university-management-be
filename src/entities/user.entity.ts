import { UserRole } from 'src/shared/constants/enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Faculty } from './faculty.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true, nullable: false })
    username: string;

    @Column({ length: 255, nullable: false })
    password: string;

    // @ManyToOne(() => Role, role => role.users, { nullable: false })
    // @JoinColumn({ name: 'role_id' })
    // role: Role;

    @Column({ length: 100, nullable: false, default: UserRole.STUDENT })
    role: UserRole;

    @Column({ length: 100, nullable: false })
    full_name: string;

    @Column({ length: 100, unique: true, nullable: true })
    email: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @Column({ nullable: true })
    faculty_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relationship
    @ManyToOne(() => Faculty, faculty => faculty.id)
    @JoinColumn({ name: 'faculty_id' })
    faculty: Faculty;
}
