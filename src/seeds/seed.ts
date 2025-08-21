import { DataSource } from 'typeorm';
import { seedCurriculumSessions } from './curriculum-session.seed';
import { config } from 'src/shared/config';
import { seedAcademicYear } from './academic-year.seed';
import { seedUsers } from './user.seed';
import { seedCourses } from './course.seed';
import { seedCourseSchedules } from './course-schedule.seed';

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: config.db.host,
    port: Number(config.db.port),
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
    entities: [__dirname + '/../entities/*{.entity.ts,.entity.js}'],
    synchronize: false
});

AppDataSource.initialize()
    .then(async () => {
        console.log('Seeding...');
        await seedAcademicYear(AppDataSource);
        await seedCurriculumSessions(AppDataSource);
        await seedUsers(AppDataSource);
        await seedCourses(AppDataSource);
        await seedCourseSchedules(AppDataSource);
        await AppDataSource.destroy();
    })
    .catch((err) => {
        console.error('Error during seeding:', err);
    });
