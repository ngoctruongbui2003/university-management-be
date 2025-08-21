import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from 'src/shared/constants/enum';
import { hashPassword } from 'src/shared/utils';

export async function seedUsers(dataSource: DataSource) {
    const repo = dataSource.getRepository(User);

    const users = [
        {
            "username": "admin",
            "password": "admin",
            "role": UserRole.ADMIN,
            "full_name": "Admin",
            "email": "admin@gmail.com",
        },
        {
            "username": "training_manager",
            "password": "training_manager",
            "role": UserRole.TRAINING_MANAGER,
            "full_name": "Training Manager",
            "email": "training_manager@gmail.com",
        },
        {
            "username": "teacher01",
            "password": "teacher01",
            "role": UserRole.TEACHER,
            "full_name": "Teacher 01",
            "email": "teacher01@gmail.com",
        },
        {
            "username": "teacher02",
            "password": "teacher02",
            "role": UserRole.TEACHER,
            "full_name": "Teacher 02",
            "email": "teacher02@gmail.com",
        },
        {
            "username": "student01",
            "password": "student01",
            "role": UserRole.STUDENT,
            "full_name": "Student 01",
            "email": "student01@gmail.com",
        },
        {
            "username": "student02",
            "password": "student02",
            "role": UserRole.STUDENT,
            "full_name": "Student 02",
            "email": "student02@gmail.com",
        },
        {
            "username": "52101006",
            "password": "52101006",
            "role": UserRole.STUDENT,
            "full_name": "Bùi Ngọc Trường",
            "email": "52101006@gmail.com",
        },
        {
            "username": "52101973",
            "password": "52101973",
            "role": UserRole.STUDENT,
            "full_name": "Nguyễn Đạt Khương",
            "email": "52101973@gmail.com",
        },
    ];

    const hashedUsers = await Promise.all(
        users.map(async (user) => {
            return repo.create({
            username: user.username,
            password: await hashPassword(user.password),
            role: user.role,
            full_name: user.full_name,
            email: user.email,
            });
        })
    );

    await repo.save(hashedUsers);
    console.log('✅ Seeded 10 users!');
}
