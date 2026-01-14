import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES } from '../queues.constant';

interface ContactJobData {
  contactId: string;
  action: string;
  [key: string]: any;
}

@Processor(QUEUES.CONTACTS)
export class ContactProcessor extends WorkerHost {
  private readonly logger = new Logger(ContactProcessor.name);

  async process(job: Job<ContactJobData>): Promise<any> {
    this.logger.log(`🔄 Processing job: ${job.id}`);

    // Simulate work (replace with real logic later)
    await this.sleep(2000);

    this.logger.log(`✅ Job ${job.id} completed successfully`);
    
    return { success: true, jobId: job.id };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}