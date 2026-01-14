import { Controller, FileTypeValidator, ParseFilePipe, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('documents')
export class DocumentsController {

    @Post('parse')
    @UseInterceptors(FilesInterceptor('files'))
    parseFiles(@UploadedFiles(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: 'application/pdf' }),
            ]
        })
    ) files: Array<Express.Multer.File>) {
        console.log("files", files);
        return files
    }

}
