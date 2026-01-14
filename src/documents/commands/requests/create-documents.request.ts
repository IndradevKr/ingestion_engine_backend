import { IsString, IsEnum, IsNumber, IsOptional, IsUUID, MaxLength, Min, IsBoolean } from 'class-validator';
import { DocumentStatus } from 'src/documents/entities/documents.entity';

export class CreateDocumentRequest {
  @IsString()
  @MaxLength(100)
  originalName: string;

  @IsString()
  @MaxLength(100)
  mimeType: string;

  @IsNumber()
  @Min(0)
  fileSize: number;

  @IsString()
  s3Path: string;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @IsString()
  @IsOptional()
  documentTypeCategory?: string;

  @IsOptional()
  extractedData?: any;

  @IsUUID()
  contactId: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}