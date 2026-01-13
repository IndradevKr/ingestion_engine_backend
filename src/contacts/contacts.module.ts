import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsCommandHandler } from './commands/handlers';
import { ContactsQueriesHandler } from './queries/handlers';
import { ContactsRepository } from './repositories/contacts.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contacts } from './entities/contacts.entitiy';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Contacts])],
  controllers: [ContactsController],
  providers: [
    ContactsRepository,
    ...ContactsCommandHandler,
    ...ContactsQueriesHandler
  ]
})
export class ContactsModule {}
