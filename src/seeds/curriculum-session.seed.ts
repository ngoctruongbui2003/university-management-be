import { DataSource } from 'typeorm';
import { CurriculumSession } from '../entities/curriculum-session.entity';

export async function seedCurriculumSessions(dataSource: DataSource) {
    const repo = dataSource.getRepository(CurriculumSession);

    const names = [
        'Core',
        'Physical Education',
        'Skills',
        'English',
        'Philosophy',
    ];

    const sessions = names.map((name, index) =>
        repo.create({
        name,
        description: `This is the ${name} session.`,
        }),
    );

    await repo.save(sessions);
    console.log('✅ Seeded 5 curriculum sessions!');
}
