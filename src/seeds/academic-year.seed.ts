import { DataSource } from 'typeorm';
import { AcademicYear, AcademicYearStatus } from '../entities/academic-year.entity';

export async function seedAcademicYear(dataSource: DataSource) {
    const repo = dataSource.getRepository(AcademicYear);

    const years = [
        '2021',
        '2022',
        '2023',
        '2024',
        '2025',
    ];

    const sessions = years.map((year, index) =>
        repo.create({
            year: Number(year),
            start_date: new Date(`${year}-09-01`),
            end_date: new Date(`${year}-08-31`),
            status: year === '2025' ? AcademicYearStatus.ACTIVE : AcademicYearStatus.CLOSED,
        }),
    );

    await repo.save(sessions);
    console.log('✅ Seeded 5 academic years!');
}
