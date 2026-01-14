import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ContactsModule } from './contacts/contacts.module';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisConfig } from './config/redis.config';
import { QueuesModule } from './queues/queues.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule.forRoot(),
    BullModule.forRoot({
      connection: redisConfig
    }),
    QueuesModule,
    ContactsModule,
    DatabaseModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
