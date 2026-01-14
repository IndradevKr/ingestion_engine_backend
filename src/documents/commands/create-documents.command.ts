import { ICommand } from "@nestjs/cqrs";
import { CreateDocumentRequest } from "./requests/create-documents.request";

export class CreateDocumentsCommand implements ICommand {
    constructor(public readonly data: CreateDocumentRequest[]) { }
}
