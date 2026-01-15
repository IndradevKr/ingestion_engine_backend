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
import { MASTER_EXTRACTION_SCHEMA } from '../../documents/constants/contact-ingestion.schema';
import { LiveUpdatesGateway } from 'src/notifications/gateways/live-updates.gateway';

interface ClassifyDocumentJobData {
    documentId: string;
    contactId: string;
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
        private readonly uploadService: UploadService,
        private readonly liveUpdatesGateway: LiveUpdatesGateway
    ) {
        super();
    }

    async process(job: Job<ClassifyDocumentJobData>): Promise<any> {
        const { documentId, s3Path, mimeType, originalName, contactId } = job.data;

        this.logger.log(`🔄 Processing document: ${originalName} (Job ${job.id})`);

        this.liveUpdatesGateway.emitDocumentStatus(documentId, contactId, 'processing', { originalName });

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
                    // Single Phase Extraction
                    this.logger.log(`🔍 Phase 2: Extracting all structured data`);
                    this.liveUpdatesGateway.emitDocumentStatus(documentId, contactId, 'extracting', { phase: 1, totalPhases: 1 });

                    const masterData = await this.geminiService.extractDocumentData(
                        fileBuffer,
                        mimeType,
                        MASTER_EXTRACTION_SCHEMA
                    );

                    extractedData = {
                        ...masterData,
                        classification,
                        processedAt: new Date().toISOString()
                    };

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

            this.liveUpdatesGateway.emitDocumentStatus(documentId, contactId, 'parsed', {
                docType
            });

            this.logger.log(`✅ Processed ${originalName} as ${docType}`);

            return {
                documentId,
                documentTypeCategory: docType,
                status: DocumentStatus.PARSED
            };
        } catch (error) {
            this.logger.error(`❌ Classification failed for ${originalName}:`, error.message);

            const isRejection = error.message.includes('Document rejected');
            const status = isRejection ? DocumentStatus.SKIPPED : DocumentStatus.FAILED;
            const liveStatus = isRejection ? 'skipped' : 'failed';

            this.logger.log(`⚠️ Attempting to update document ${documentId} to status: ${status}`);

            try {
                await this.commandBus.execute(new UpdateDocumentClassificationCommand({
                    documentId,
                    status,
                    extractedData: {
                        error: error.message,
                        failedAt: new Date().toISOString()
                    }
                }));
                this.logger.log(`✅ Document ${documentId} updated to ${status}`);
            } catch (updateError) {
                this.logger.error(`❌ Failed to update document ${documentId}: ${updateError.message}`);
                // If it's a rejection, we still don't want to retry even if the status update fails
                if (isRejection) return { documentId, status: 'error_updating_status', error: error.message };
            }

            this.liveUpdatesGateway.emitDocumentStatus(documentId, contactId, liveStatus, { error: error.message });

            if (isRejection) {
                this.logger.log(`🛑 Rejection handled, job complete.`);
                return { documentId, status, message: error.message };
            }

            throw error;
        }
    }
}
