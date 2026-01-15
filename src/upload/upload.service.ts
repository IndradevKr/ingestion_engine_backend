import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3config from 'src/config/s3.config';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: s3config.awsRegion,
      credentials: {
        accessKeyId: s3config.awsAccessKeyId || '',
        secretAccessKey: s3config.awsSecretKey || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File) {
    const uniqueKey = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: s3config.awsBucketName,
      Key: uniqueKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      return {
        key: uniqueKey,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }

  async getDocumentSignedUrl(s3Path: string) {
    const command = new GetObjectCommand({
      Bucket: s3config.awsBucketName,
      Key: s3Path
    })

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  }

  async downloadFile(s3Path: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: s3config.awsBucketName,
      Key: s3Path
    });

    try {
      const response = await this.s3Client.send(command);

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('S3 Download Error:', error);
      throw new InternalServerErrorException(`Failed to download file from S3: ${s3Path}`);
    }
  }
}
