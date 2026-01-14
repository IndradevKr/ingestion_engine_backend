import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateDocumentsCommand } from "../create-documents.command";
import { DocumentsRepository } from "src/documents/repositories/documents.repository";

@CommandHandler(CreateDocumentsCommand)
export class CreateDocumentsHandler implements ICommandHandler<CreateDocumentsCommand> {
    constructor(private readonly documentsRepository: DocumentsRepository) { }

    async execute(command: CreateDocumentsCommand) {
        return this.documentsRepository.create(command.data);
    }
}
