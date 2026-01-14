import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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
    const fileExtension = file.originalname.split('.').pop();
    const uniqueKey = `uploads/${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}.${fileExtension}`;

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
}
