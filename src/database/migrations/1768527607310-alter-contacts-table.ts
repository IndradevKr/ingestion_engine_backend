import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsTable1768527607310 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('contacts', new TableColumn({
            name: 'address',
            type: 'jsonb',
            isNullable: true,
        }));

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('contacts', 'address');
    }

}
