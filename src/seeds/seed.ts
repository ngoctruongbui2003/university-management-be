// src/seeder/seed.ts
import { DataSource } from 'typeorm';
import { seedCurriculumSessions } from './curriculum-session.seed';
import { config } from 'src/shared/config';

// Import config giống như trong main.ts
export const AppDataSource = new DataSource({
    type: 'mariadb', // hoặc postgres/sqlite
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
        await seedCurriculumSessions(AppDataSource);
        await AppDataSource.destroy();
    })
    .catch((err) => {
        console.error('Error during seeding:', err);
    });
