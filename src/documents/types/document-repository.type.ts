import { CreateDocumentRequest } from "../commands/requests/create-documents.request";
import { Documents } from "../entities/documents.entity";

export interface IDocumentsRepository {
    create(data: CreateDocumentRequest[]);
    findAll(): Promise<Documents[] | null>;
    findByContactId(contactId: string): Promise<Documents[] | null>;
}