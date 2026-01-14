import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ContactProcessor } from './processors/contact.processor';
import { QUEUES } from './queues.constant';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.CONTACTS,
    }),
  ],
  providers: [ContactProcessor],
  exports: [BullModule],
})
export class QueuesModule {}