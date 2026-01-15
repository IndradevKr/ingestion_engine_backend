import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ContactProcessor } from './processors/contact.processor';
import { DocumentClassificationProcessor } from './processors/document-classification.processor';
import { QUEUES } from './queues.constant';
import { DocumentsModule } from 'src/documents/documents.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUES.CONTACTS,
      },
      {
        name: QUEUES.DOCUMENTS,
      }
    ),
    DocumentsModule,
    UploadModule  // Import to get UploadService
  ],
  providers: [ContactProcessor, DocumentClassificationProcessor],
  exports: [BullModule],
})
export class QueuesModule { }