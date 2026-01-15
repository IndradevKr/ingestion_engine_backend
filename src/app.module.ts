import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ContactsModule } from './contacts/contacts.module';
import { DatabaseModule } from './database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisConfig } from './config/redis.config';
import { QueuesModule } from './queues/queues.module';
import { DocumentsModule } from './documents/documents.module';
import { MulterError } from 'multer';
import { MulterModule } from '@nestjs/platform-express';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule.forRoot(),
    BullModule.forRoot({
      connection: redisConfig
    }),
    MulterModule,
    UploadModule,
    NotificationsModule,
    ContactsModule,
    DatabaseModule,
    DocumentsModule,
    QueuesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
