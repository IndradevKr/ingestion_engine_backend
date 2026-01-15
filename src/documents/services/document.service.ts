import { BadRequestException, Injectable } from "@nestjs/common";

export interface DocumentClassification {
    documentType: string;
    confidence: number;
    isRelevant: boolean;
    reason: string;
}

@Injectable()
export class DocumentService {
    constructor() { }

    // Minimum confidence threshold for accepting a classification
    private readonly MIN_CONFIDENCE = 0.6;

    /**
     * Validates and processes the document classification from Gemini AI
     * @param classification - The classification object from Gemini
     * @returns The validated document type
     * @throws BadRequestException if document is irrelevant or low confidence
     */
    validateClassification(classification: DocumentClassification): string {
        // Check if document is relevant
        if (!classification.isRelevant || classification.documentType === 'irrelevant') {
            throw new BadRequestException(
                `Document rejected: ${classification.reason || 'Document is not a valid education document'}`
            );
        }

        // Check confidence threshold
        if (classification.confidence < this.MIN_CONFIDENCE) {
            throw new BadRequestException(
                `Document rejected: Low confidence (${classification.confidence.toFixed(2)}). ${classification.reason}`
            );
        }

        // Map to standardized document type names
        return this.mapDocumentType(classification.documentType);
    }

    /**
     * Maps Gemini's document type to our internal naming convention
     */
    private mapDocumentType(geminiType: string): string {
        const typeMap: Record<string, string> = {
            'resume': 'Resume',
            'transcript': 'Transcript',
            'coe': 'Certificate_of_Enrollment',
            'test_score': 'Test_Score',
            'passport': 'Passport',
            'financial_document': 'Financial_Document'
        };

        return typeMap[geminiType.toLowerCase()] || 'Other';
    }

    /**
     * Legacy method - kept for backward compatibility
     * @deprecated Use validateClassification instead
     */
    classifyDocumentType(responseText: string): string {
        const lowerText = responseText.toLowerCase();

        if (lowerText.includes('resume') || lowerText.includes('cv')) {
            return 'Resume';
        } else if (lowerText.includes('transcript') || lowerText.includes('marksheet')) {
            return 'Transcript';
        } else if (lowerText.includes('coe') || lowerText.includes('enrollment')) {
            return 'Certificate_of_Enrollment';
        } else if (lowerText.includes('test') || lowerText.includes('score') ||
            lowerText.includes('ielts') || lowerText.includes('toefl')) {
            return 'Test_Score';
        } else {
            return 'Other';
        }
    }
}