import { BadRequestException, Body, Controller, FileTypeValidator, Get, Param, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { DocumentStatus } from './entities/documents.entity';
import { CreateDocumentsCommand } from './commands/create-documents.command';
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
        const documentsData = await Promise.all(files.map(async (file) => {
            try {
                console.log("file: ", file)
                const responseText = await this.geminiService.processFile(file.buffer, file.mimetype);
                console.log("response:", responseText)
                const docType = this.documentService.classifyDocumentType(responseText);
                console.log("docType", docType)
                return {
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    fileSize: file.size,
                    s3Path: null,
                    contactId: body.contactId,
                    status: DocumentStatus.UPLOADED,
                    docType,
                    geminiResponse: responseText,
                };
            } catch (error) {
                console.error('Error processing file:', error);
                return { skip: true };
            }
        }));

        const filteredDocuments = documentsData.filter(doc => !doc.skip);
        if (filteredDocuments.length === 0) {
            throw new BadRequestException('No valid files to upload');
        }
        return filteredDocuments;

        // return this.commandBus.execute(new CreateDocumentsCommand(filteredDocuments));


        // const uploadPromises = files.map(file => this.uploadService.uploadFile(file));
        // const s3Results = await Promise.all(uploadPromises);

        // const documentsData = s3Results.map(res => ({
        //     originalName: res.originalName,
        //     mimeType: res.mimetype,
        //     fileSize: res.size,
        //     s3Path: res.key,
        //     contactId: body.contactId,
        //     status: DocumentStatus.UPLOADED,
        // }));
        // return this.commandBus.execute(
        //     new CreateDocumentsCommand(documentsData)
        // );
    }

    @Get(':contactId')
    async fetchDocumentsByContactId(@Param(':contactId') contactId: string) {
        return await this.queryBus.execute(new FindDocumentsByContactId(contactId))
    }
}
