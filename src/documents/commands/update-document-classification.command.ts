import { ICommand } from "@nestjs/cqrs";
import { DocumentStatus } from "src/documents/entities/documents.entity";

export interface UpdateDocumentClassificationData {
    documentId: string;
    documentTypeCategory?: string;
    status: DocumentStatus;
    extractedData?: any;
}

export class UpdateDocumentClassificationCommand implements ICommand {
    constructor(public readonly data: UpdateDocumentClassificationData) { }
}
