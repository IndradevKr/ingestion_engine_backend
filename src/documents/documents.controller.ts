import { BadRequestException, Body, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { DocumentStatus } from './entities/documents.entity';
import { CreateDocumentsCommand } from './commands/create-documents.command';
import { UpdateDocumentClassificationCommand } from './commands/update-document-classification.command';
import { FindDocumentsByContactId } from './queries/find-document-by-contactId.query';
import { GeminiService } from './services/gemini.service';
import { DocumentService } from './services/document.service';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly uploadService: UploadService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly geminiService: GeminiService,
        private readonly documentService: DocumentService
    ) { }

    @Post('parse')
    @UseInterceptors(FilesInterceptor('files'))
    async parseFiles(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: /^(image\/(png|jpeg)|application\/pdf)$/ }),
                ]
            })
        ) files: Array<Express.Multer.File>,
        @Body() body: { contactId: string }
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }
        if (!body.contactId) {
            throw new BadRequestException('Contact ID is required');
        }

        // Phase 1: Upload all files to S3 in parallel
        console.log(`Uploading ${files.length} file(s) to S3...`);
        const uploadPromises = files.map(file => this.uploadService.uploadFile(file));
        const s3Results = await Promise.all(uploadPromises);

        // Phase 2: Save documents to database with PROCESSING status
        const documentsData = s3Results.map(res => ({
            originalName: res.originalName,
            mimeType: res.mimetype,
            fileSize: res.size,
            s3Path: res.key,
            contactId: body.contactId,
            status: DocumentStatus.PROCESSING,
        }));

        const savedDocuments = await this.commandBus.execute(
            new CreateDocumentsCommand(documentsData)
        );

        console.log(`Saved ${savedDocuments.length} document(s) to database`);

        // Phase 3: Classify documents with Gemini AI and update database
        // TODO: Move this to a background queue processor for better performance
        const classificationPromises = savedDocuments.map(async (doc) => {
            try {
                // Find the original file buffer
                const originalFile = files.find(f => f.originalname === doc.originalName);
                if (!originalFile) {
                    console.error(`Could not find original file for ${doc.originalName}`);
                    return null;
                }

                console.log(`Classifying document: ${doc.originalName}`);
                const classification = await this.geminiService.processFile(
                    originalFile.buffer,
                    originalFile.mimetype
                );

                // Validate classification
                const docType = this.documentService.validateClassification(classification);

                // Update document in database with classification results
                await this.commandBus.execute(new UpdateDocumentClassificationCommand({
                    documentId: doc.id,
                    documentTypeCategory: docType,
                    status: DocumentStatus.PARSED,
                    extractedData: {
                        classification: classification,
                        processedAt: new Date().toISOString()
                    }
                }));

                return {
                    documentId: doc.id,
                    documentTypeCategory: docType,
                    status: DocumentStatus.PARSED
                };
            } catch (error) {
                console.error(`Classification failed for ${doc.originalName}:`, error.message);

                // Update document status to FAILED
                await this.commandBus.execute(new UpdateDocumentClassificationCommand({
                    documentId: doc.id,
                    status: DocumentStatus.FAILED,
                    extractedData: {
                        error: error.message,
                        failedAt: new Date().toISOString()
                    }
                }));

                return {
                    documentId: doc.id,
                    status: DocumentStatus.FAILED,
                    error: error.message
                };
            }
        });

        const classificationResults = await Promise.all(classificationPromises);

        return {
            success: true,
            message: `Successfully uploaded ${savedDocuments.length} document(s)`,
            documents: savedDocuments,
            classifications: classificationResults.filter(r => r !== null)
        };
    }

    @Get(':contactId')
    async fetchDocumentsByContactId(@Param(':contactId') contactId: string) {
        return await this.queryBus.execute(new FindDocumentsByContactId(contactId))
    }
}
