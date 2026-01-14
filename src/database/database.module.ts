import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './datasource';
import { Contacts } from 'src/contacts/entities/contacts.entitiy';
import { Documents } from 'src/documents/entities/documents.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            ...dataSourceOptions,
            entities: [Contacts, Documents]
        })
    ]
})
export class DatabaseModule {}
