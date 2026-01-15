import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateDocumentClassificationCommand } from "../update-document-classification.command";
import { DocumentsRepository } from "src/documents/repositories/documents.repository";

@CommandHandler(UpdateDocumentClassificationCommand)
export class UpdateDocumentClassificationHandler implements ICommandHandler<UpdateDocumentClassificationCommand> {
    constructor(private readonly documentsRepository: DocumentsRepository) { }

    async execute(command: UpdateDocumentClassificationCommand) {
        const { documentId, documentTypeCategory, status, extractedData } = command.data;

        // Build update object with only provided fields
        const updateData: any = { status };

        if (documentTypeCategory) {
            updateData.documentTypeCategory = documentTypeCategory;
        }

        if (extractedData) {
            updateData.extractedData = extractedData;
        }

        return this.documentsRepository.update(documentId, updateData);
    }
}
