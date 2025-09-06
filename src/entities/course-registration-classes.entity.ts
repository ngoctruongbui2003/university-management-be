import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CourseRegistration } from './course-registration.entity';
import { Classes } from './classes.entity';

@Entity('course_registration_classes')
export class CourseRegistrationClasses {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    course_registration_id: number;

    @Column()
    class_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // ---------------Relationships---------------
    @ManyToOne(() => CourseRegistration, courseRegistration => courseRegistration.courseRegistrationClasses)
    @JoinColumn({ name: 'course_registration_id' })
    courseRegistration: CourseRegistration;

    @ManyToOne(() => Classes, classes => classes.id)
    @JoinColumn({ name: 'class_id' })
    class: Classes;
}
