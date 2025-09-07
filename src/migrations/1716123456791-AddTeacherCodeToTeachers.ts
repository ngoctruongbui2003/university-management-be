import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTeacherCodeToTeachers1716123456791 implements MigrationInterface {
    name = 'AddTeacherCodeToTeachers1716123456791';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('teachers', new TableColumn({
            name: 'teacher_code',
            type: 'varchar',
            length: '20',
            isUnique: true,
            isNullable: true, // Initially nullable to allow existing records
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('teachers', 'teacher_code');
    }
}
