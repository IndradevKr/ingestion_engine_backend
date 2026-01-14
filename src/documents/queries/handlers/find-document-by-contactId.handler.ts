import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { FindDocumentsByContactId } from "../find-document-by-contactId.query";
import { DocumentsRepository } from "src/documents/repositories/documents.repository";

@QueryHandler(FindDocumentsByContactId)
export class FindDocumentsByContactIdHandler implements IQueryHandler<FindDocumentsByContactId> {
    constructor(private readonly contactsRepository: DocumentsRepository) {}

    async execute(query: FindDocumentsByContactId): Promise<any> {
        return await this.contactsRepository.findByContactId(query.contactId);
    }
}