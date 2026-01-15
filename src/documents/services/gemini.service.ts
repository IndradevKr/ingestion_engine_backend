import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { createPartFromUri, createUserContent, GoogleGenAI } from '@google/genai'
import { geminiConfig } from 'src/config/gemini.config';

import * as os from 'os';

@Injectable()
export class GeminiService {
    private readonly apiKey: string;
    private ai: GoogleGenAI;

    constructor() {
        this.apiKey = geminiConfig.apiKey;

        if (!this.apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        this.ai = new GoogleGenAI({
            apiKey: this.apiKey
        });
    }

    async generateResponse(prompt: string): Promise<string | undefined> {
        try {
            const result = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });
            return result.text;
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw new Error('Failed to generate response');
        }
    }

    fileToGenerativePart(path: string, mimeType: string): any {
        return {
            inlineData: {
                data: Buffer.from(fs.readFileSync(path)).toString("base64"),
                mimeType,
            },
        };
    }

    // async getJsonOutput(prompt: string): Promise<any> {
    //     try {
    //         const model = this.ai.models.generateContent({
    //             model: "gemini-2.5-flash",
    //             config: { responseMimeType: "application/json" },
    //         });

    //         const result = await model.generateContent(prompt);
    //         return JSON.parse(result.response.text());
    //     } catch (error) {
    //         console.error("Gemini API Error:", error);
    //         throw new Error('Failed to get JSON output');
    //     }
    // }

    // async processFile(fileBuffer: Buffer, mimeType: string): Promise<any> {
    //     if (!fileBuffer) {
    //         throw new Error('No file buffer provided');
    //     }

    //     try {
    //         if (mimeType.startsWith('image')) {
    //             return await this.processImage(fileBuffer, mimeType);
    //         } else if (mimeType === 'application/pdf') {
    //             return await this.processPdfFile(fileBuffer, mimeType);
    //         } else {
    //             throw new Error(`Unsupported MIME type: ${mimeType}`);
    //         }
    //     } catch (error) {
    //         console.error('Error processing file:', error);
    //         throw error;
    //     }
    // }

    // async processImage(imageBuffer: Buffer, mimeType: string): Promise<any> {
    //     console.log('Processing image buffer');
    //     const text = imageBuffer.toString();
    //     return await this.getJsonOutput(text);
    // }

    async processFile(fileBuffer: Buffer, mimeType: string): Promise<any> {
        console.log('Processing PDF buffer');
   // Create a temporary file path
            const tempFilePath = os.tmpdir() + '/gemini-' + Date.now().toString();
            console.log('Temporary file path:', tempFilePath);

            // Write the buffer to the temporary file asynchronously
            await new Promise((resolve, reject) => {
                fs.writeFile(tempFilePath, fileBuffer, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve('file created');
                    }
                });
            });

            console.log('File written to temporary location');

        try {
            const prompt = 'What type of document is this?';


            const uploadedFile = await this.ai.files.upload({
                file: tempFilePath,
                config: { mimeType: mimeType }
            })

            if (!uploadedFile.uri || !uploadedFile.mimeType) {
                console.error('Uploaded file does not have a valid URI or mimetype:', uploadedFile);
                throw new Error('Failed to upload file');
            }


            const response = await this.ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: createUserContent([
                    createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
                    prompt
                ])
            });

            console.log("response from upload", response)
            return response.text;

            // const text = pdfBuffer.toString();
            // return await this.getJsonOutput(text);
        } catch (error) {
            console.error('Error processing text:', error);
            throw error;
        } finally {
            fs.unlinkSync(tempFilePath);
            console.log('Temporary file cleaned up');
        }
    }
}
