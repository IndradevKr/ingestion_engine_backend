import { BadRequestException, Body, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UploadService } from 'src/upload/upload.service';
import { DocumentStatus } from './entities/documents.entity';
import { CreateDocumentsCommand } from './commands/create-documents.command';
import { FindDocumentsByContactId } from './queries/find-document-by-contactId.query';
import { QUEUES } from 'src/queues/queues.constant';

@Controller('documents')
export class DocumentsController {
    constructor(
        private readonly uploadService: UploadService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        @InjectQueue(QUEUES.DOCUMENTS) private readonly documentQueue: Queue
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

        // Phase 2: Save documents to database with UPLOADED status
        const documentsData = s3Results.map(res => ({
            originalName: res.originalName,
            mimeType: res.mimetype,
            fileSize: res.size,
            s3Path: res.key,
            contactId: body.contactId,
            status: DocumentStatus.UPLOADED,
        }));

        const savedDocuments = await this.commandBus.execute(
            new CreateDocumentsCommand(documentsData)
        );

        console.log(`Saved ${savedDocuments.length} document(s) to database`);

        // Phase 3: Queue documents for background classification
        const queuePromises = savedDocuments.map(async (doc) => {
            return this.documentQueue.add('classify-document', {
                documentId: doc.id,
                s3Path: doc.s3Path,
                mimeType: doc.mimeType,
                originalName: doc.originalName
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                },
                removeOnComplete: true,
                removeOnFail: false
            });
        });

        await Promise.all(queuePromises);

        console.log(`Queued ${savedDocuments.length} document(s) for classification`);

        // Return immediately without waiting for classification
        return {
            success: true,
            message: `Successfully uploaded ${savedDocuments.length} document(s). Classification in progress.`,
            documents: savedDocuments
        };
    }

    @Get(':contactId')
    async fetchDocumentsByContactId(@Param('contactId') contactId: string) {
        return await this.queryBus.execute(new FindDocumentsByContactId(contactId))
    }
}