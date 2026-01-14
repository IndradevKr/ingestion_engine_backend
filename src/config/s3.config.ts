import 'dotenv/config';

const s3config = {
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKey: process.env.AWS_ACCESS_SECRET_KEY_ID,
  awsRegion: process.env.AWS_REGION,
  awsBucketName: process.env.AWS_BUCKET_NAME,
};

export default s3config;
