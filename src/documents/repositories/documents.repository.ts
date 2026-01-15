import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Documents } from "../entities/documents.entity";
import { IDocumentsRepository } from "../types/document-repository.type";
import { Repository } from "typeorm";
import { CreateDocumentRequest } from "../commands/requests/create-documents.request";
import { UploadService } from "src/upload/upload.service";

@Injectable()
export class DocumentsRepository implements IDocumentsRepository {
    constructor(
        @InjectRepository(Documents)
        private documentsRepository: Repository<Documents>,
        private uploadService: UploadService
    ) { }

    create(data: CreateDocumentRequest[]) {
        return this.documentsRepository.save(data);
    }

    findAll(): Promise<Documents[] | null> {
        return this.documentsRepository.find();
    }

    async findByContactId(contactId: string): Promise<Documents[] | null> {
        const data = await this.documentsRepository.findBy({
            contactId
        })

        const promises = data.map(async (d: Documents) => {
            const signedUrl = await this.uploadService.getDocumentSignedUrl(d.s3Path)
            return {
                ...d,
                signedUrl
            }
        })
        const dataWithSignedUrl = await Promise.all(promises);
        return dataWithSignedUrl;
    }

    async update(documentId: string, updateData: Partial<Documents>): Promise<Documents | null> {
        await this.documentsRepository.update(documentId, updateData);
        return this.documentsRepository.findOne({ where: { id: documentId } });
    }
}