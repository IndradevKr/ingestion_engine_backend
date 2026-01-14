import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDocumentTable1768297985330 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'documents',
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
                    name: "original_name",
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: "mime_type",
                    type: "varchar",
                    length: '100',
                    isNullable: false
                },
                {
                    name: "file_size",
                    type: "bigint",
                    isNullable: false
                },
                {
                    name: 's3_path',
                    type: 'varchar',
                    isNullable: false
                },
                {
                    name: 'status',
                    type: 'enum',
                    enum: ['processing', 'uploaded', 'parsed', 'failed'],
                    default: "'processing'",
                    isNullable: false
                },
                { name: 'document_type_category', type: 'varchar', isNullable: true },
                {
                    name: "extracted_data",
                    type: "jsonb",
                    isNullable: true,
                    comment: "Extracted structured data from PDF"
                },
                {
                    name: "contact_id",
                    type: "uuid",
                    isNullable: false,
                    comment: "Foreign key to contacts table"
                },
                {
                    name: 'is_deleted',
                    type: 'boolean',
                    isNullable: false,
                    default: false,
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
        await queryRunner.createForeignKey('documents', new TableForeignKey({
            name: 'FK_documents_contact',
            columnNames: ['contact_id'],
            referencedTableName: 'contacts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('documents', 'FK_documents_contact');
        await queryRunner.dropTable('documents')
    }

}
