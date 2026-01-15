import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { QUEUES } from '../queues.constant';
import { GeminiService } from 'src/documents/services/gemini.service';
import { DocumentService } from 'src/documents/services/document.service';
import { UpdateDocumentClassificationCommand } from 'src/documents/commands/update-document-classification.command';
import { DocumentStatus } from 'src/documents/entities/documents.entity';
import { UploadService } from 'src/upload/upload.service';
import { CONTACT_INGESTION_SCHEMA } from '../../documents/constants/contact-ingestion.schema';

interface ClassifyDocumentJobData {
    documentId: string;
    s3Path: string;
    mimeType: string;
    originalName: string;
}

@Processor(QUEUES.DOCUMENTS)
export class DocumentClassificationProcessor extends WorkerHost {
    private readonly logger = new Logger(DocumentClassificationProcessor.name);

    constructor(
        private readonly geminiService: GeminiService,
        private readonly documentService: DocumentService,
        private readonly commandBus: CommandBus,
        private readonly uploadService: UploadService
    ) {
        super();
    }

    async process(job: Job<ClassifyDocumentJobData>): Promise<any> {
        const { documentId, s3Path, mimeType, originalName } = job.data;

        this.logger.log(`🔄 Processing document: ${originalName} (Job ${job.id})`);

        try {
            // Download file from S3
            this.logger.log(`📥 Downloading from S3: ${s3Path}`);
            const fileBuffer = await this.uploadService.downloadFile(s3Path);

            // 1. Classify with Gemini AI
            this.logger.log(`🔍 Classifying: ${originalName}`);
            const classification = await this.geminiService.classifyDocument(
                fileBuffer,
                mimeType
            );

            // Validate classification
            const docType = this.documentService.validateClassification(classification);

            let extractedData: any = {
                classification,
                processedAt: new Date().toISOString()
            };

            // 2. If it's a relevant education document, perform extraction
            const extractableTypes = ['resume', 'transcript', 'test_score', 'certificate_of_enrollment'];
            if (extractableTypes.includes(docType.toLowerCase())) {
                this.logger.log(`📄 Extracting structured data for ${docType}: ${originalName}`);
                try {
                    const extracted = await this.geminiService.extractDocumentData(
                        fileBuffer,
                        mimeType,
                        CONTACT_INGESTION_SCHEMA
                    );
                    extractedData = extracted;
                    this.logger.log(`✅ Extraction successful for ${originalName}`);
                } catch (extractError) {
                    this.logger.warn(`⚠️ Extraction failed for ${originalName} (classification preserved): ${extractError.message}`);
                }
            }

            // Update document in database
            await this.commandBus.execute(new UpdateDocumentClassificationCommand({
                documentId,
                documentTypeCategory: docType,
                status: DocumentStatus.PARSED,
                extractedData
            }));

            this.logger.log(`✅ Processed ${originalName} as ${docType}`);

            return {
                documentId,
                documentTypeCategory: docType,
                status: DocumentStatus.PARSED
            };
        } catch (error) {
            this.logger.error(`❌ Classification failed for ${originalName}:`, error.message);

            // Update document status to FAILED
            await this.commandBus.execute(new UpdateDocumentClassificationCommand({
                documentId,
                status: DocumentStatus.FAILED,
                extractedData: {
                    error: error.message,
                    failedAt: new Date().toISOString()
                }
            }));

            throw error; // Re-throw for BullMQ retry mechanism
        }
    }
}
