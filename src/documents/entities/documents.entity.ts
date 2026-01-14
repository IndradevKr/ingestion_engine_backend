import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsString, IsEnum, IsBoolean, IsNumber, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { Contacts } from 'src/contacts/entities/contacts.entitiy';

export enum DocumentStatus {
    PROCESSING = 'processing',
    UPLOADED = 'uploaded',
    PARSED = 'parsed',
    FAILED = 'failed'
}

@Entity('documents')
export class Documents {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id: string;

    @Column({ name: 'original_name', type: 'varchar', length: 100 })
    @IsString()
    @MaxLength(100)
    originalName: string;

    @Column({ name: 'mime_type', type: 'varchar', length: 100 })
    @IsString()
    @MaxLength(100)
    mimeType: string;

    @Column({
        name: 'file_size', type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value)
        }
    })
    @IsNumber()
    fileSize: number;

    @Column({ name: 's3_path', type: 'varchar' })
    @IsString()
    s3Path: string;

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.PROCESSING
    })
    @IsEnum(DocumentStatus)
    status: DocumentStatus;

    @Column({ name: 'document_type_category', type: 'varchar', nullable: true })
    @IsString()
    @IsOptional()
    documentTypeCategory: string;

    @Column({ name: 'extracted_data', type: 'jsonb', nullable: true })
    @IsOptional()
    extractedData: any;

    @Column({ name: 'contact_id', type: 'uuid' })
    @IsUUID()
    contactId: string;

    @ManyToOne(() => Contacts, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'contact_id' })
    contact: Contacts;

    @Column({ name: 'is_deleted', type: 'boolean', default: false })
    @IsBoolean()
    isDeleted: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date;

    @IsOptional()
    signedUrl?: string;
}