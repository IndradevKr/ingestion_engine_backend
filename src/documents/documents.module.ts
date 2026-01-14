import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { UploadModule } from 'src/upload/upload.module';
import { UploadService } from 'src/upload/upload.service';
import { DocumentsRepository } from './repositories/documents.repository';
import { DocumentsCommandHandlers } from './commands/handlers';
import { DocumentsQueriesHandlers } from './queries/handlers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documents } from './entities/documents.entity';
import { GeminiService } from './services/gemini.service';
import { DocumentService } from './services/document.service';

@Module({
  imports: [UploadModule, TypeOrmModule.forFeature([Documents])],
  controllers: [DocumentsController],
  providers: [
    UploadService,
    DocumentsRepository,
    GeminiService,
    DocumentService,
    ...DocumentsCommandHandlers,
    ...DocumentsQueriesHandlers,
  ]
})
export class DocumentsModule {}
