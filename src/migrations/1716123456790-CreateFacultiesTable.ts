import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFacultiesTable1716123456790 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {

        // Insert permissions
        await queryRunner.query(`
            INSERT INTO permission (name) VALUES
            ('create:faculty'),
            ('read:faculty'),
            ('update:faculty'),
            ('delete:faculty');
        `);

        // Assign permissions to role_id = 1 (Admin)
        await queryRunner.query(`
            INSERT INTO role_permission (role_id, permission_id)
            SELECT 1, id FROM permission 
            WHERE name IN (
                'create:faculty',
                'read:faculty',
                'update:faculty',
                'delete:faculty'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove role-permission assignments
        await queryRunner.query(`
            DELETE FROM role_permission 
            WHERE role_id = 1 
            AND permission_id IN (
                SELECT id FROM permission 
                WHERE name IN (
                    'create:faculty',
                    'read:faculty',
                    'update:faculty',
                    'delete:faculty'
                )
            );
        `);

        // Remove permissions
        await queryRunner.query(`
            DELETE FROM permission WHERE name IN (
                'create:faculty',
                'read:faculty',
                'update:faculty',
                'delete:faculty'
            );
        `);

        // Drop faculties table
        await queryRunner.query(`DROP TABLE IF EXISTS faculties;`);
    }
}