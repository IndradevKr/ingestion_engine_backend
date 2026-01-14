import { BadRequestException, Body, Controller, FileTypeValidator, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from 'src/upload/upload.service';
import { DocumentStatus } from './entities/documents.entity';
import { CreateDocumentsCommand } from './commands/create-documents.command';

@Controller('documents')
export class DocumentsController {
    constructor(private readonly uploadService: UploadService,
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    @Post('parse')
    @UseInterceptors(FilesInterceptor('files'))
    async parseFiles(
        @UploadedFiles(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: 'application/pdf' }),
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
        const uploadPromises = files.map(file => this.uploadService.uploadFile(file));
        const s3Results = await Promise.all(uploadPromises);

        const documentsData = s3Results.map(res => ({
            originalName: res.originalName,
            mimeType: res.mimetype,
            fileSize: res.size,
            s3Path: res.key,
            contactId: body.contactId,
            status: DocumentStatus.UPLOADED,
        }));
        return this.commandBus.execute(
            new CreateDocumentsCommand(documentsData)
        );
    }

}
