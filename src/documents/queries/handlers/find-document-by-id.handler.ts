import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindDocumentsByContactId } from "../find-document-by-contactId.query";
import { DocumentsRepository } from "src/documents/repositories/documents.repository";
import { FindDocumentById } from "../find-document-by-id.query";

@QueryHandler(FindDocumentById)
export class FindDocumentByIdHandler implements IQueryHandler<FindDocumentById> {
    constructor(private readonly documentsRepository: DocumentsRepository) {}

    async execute(query: FindDocumentById): Promise<any> {
        return await this.documentsRepository.findById(query.id);
    }
}