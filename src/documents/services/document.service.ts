import { Injectable } from "@nestjs/common";

@Injectable()
export class DocumentService {
    constructor() {}

    classifyDocumentType(responseText: string): string {
        if (responseText.includes('resume')) {
            return 'Resume';
        } else if (responseText.includes('transcript')) {
            return 'Transcript';
        } else if (responseText.includes('coe')) {
            return 'COE';
        } else if (responseText.includes('testScore')) {
            return 'Test_Score';
        } else {
            return 'Other';
        }
    }

}