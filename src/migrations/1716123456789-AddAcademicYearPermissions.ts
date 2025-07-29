import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAcademicYearPermissions1716123456789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First insert the permissions
        await queryRunner.query(`
            INSERT INTO permission (name) VALUES
            ('create:academic-year'),
            ('read:academic-year'),
            ('update:academic-year'),
            ('delete:academic-year');
        `);

        // Then assign these permissions to role_id = 1
        await queryRunner.query(`
            INSERT INTO role_permission (role_id, permission_id)
            SELECT 1, id FROM permission 
            WHERE name IN (
                'create:academic-year',
                'read:academic-year',
                'update:academic-year',
                'delete:academic-year'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First remove the role-permission assignments
        await queryRunner.query(`
            DELETE FROM role_permission 
            WHERE role_id = 1 
            AND permission_id IN (
                SELECT id FROM permission 
                WHERE name IN (
                    'create:academic-year',
                    'read:academic-year',
                    'update:academic-year',
                    'delete:academic-year'
                )
            );
        `);

        // Then remove the permissions
        await queryRunner.query(`
            DELETE FROM permission WHERE name IN (
                'create:academic-year',
                'read:academic-year',
                'update:academic-year',
                'delete:academic-year'
            );
        `);
    }
} 