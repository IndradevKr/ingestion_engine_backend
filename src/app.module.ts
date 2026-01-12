import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ContactsModule } from './contacts/contacts.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [CqrsModule.forRoot(), ContactsModule, DatabaseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
