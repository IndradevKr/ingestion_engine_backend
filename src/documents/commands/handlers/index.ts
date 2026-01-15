import { CreateDocumentsHandler } from "./create-documents.handler";
import { UpdateDocumentClassificationHandler } from "./update-document-classification.handler";

export const DocumentsCommandHandlers = [
    CreateDocumentsHandler,
    UpdateDocumentClassificationHandler
]