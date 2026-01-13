import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateContactsTable1768210423692 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await queryRunner.createTable(new Table({
            name: 'contacts',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isGenerated: true,
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()'
                },
                {
                    name: 'first_name',
                    type: 'varchar',
                    length: '100',
                    isNullable: false
                },
                {
                    name: 'last_name',
                    type: 'varchar',
                    length: '100',
                    isNullable: true
                },
                {
                    name: 'email',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'country_code',
                    type: 'varchar',
                    length: '10',
                    isNullable: true,
                },
                {
                    name: 'phone',
                    type: 'varchar',
                    length: '20',
                    isNullable: true,
                },
                { name: 'address_line_one', type: 'varchar', isNullable: true },
                {
                    name: 'is_verified',
                    type: 'boolean',
                    isNullable: false,
                    default: false
                },
                {
                    name: 'application_summary',
                    type: 'jsonb',
                    isNullable: true
                },
                {
                    name: 'education_backgrounds',
                    type: 'jsonb',
                    isNullable: true,
                    default: "'[]'::jsonb"
                },
                {
                    name: 'professional_experiences',
                    type: 'jsonb',
                    isNullable: true,
                    default: "'[]'::jsonb"
                },
                {
                    name: 'language_test_scores',
                    type: 'jsonb',
                    isNullable: true,
                    default: "'[]'::jsonb" 
                },
                {
                    name: 'created_at',
                    type: 'timestamptz',
                    default: 'now()',
                    isNullable: true,
                },
                {
                    name: 'updated_at',
                    type: 'timestamptz',
                    default: 'now()',
                    isNullable: true,
                }
            ]
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('contacts');
    }

}
