import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Documents } from "../entities/documents.entity";
import { IDocumentsRepository } from "../types/document-repository.type";
import { Repository } from "typeorm";
import { CreateDocumentRequest } from "../commands/requests/create-documents.request";

@Injectable()
export class DocumentsRepository implements IDocumentsRepository {
    constructor(
        @InjectRepository(Documents)
        private documentsRepository: Repository<Documents>
    ) { }

    create(data: CreateDocumentRequest[]) {
        return this.documentsRepository.save(data);
    }

    findAll(): Promise<Documents[] | null> {
        return this.documentsRepository.find();
    }

    findOneByContactId(contactId: string): Promise<Documents[] | null> {
        return this.documentsRepository.findBy({
            contactId
        })
    }
}