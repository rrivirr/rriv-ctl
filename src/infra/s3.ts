import { S3 } from "@aws-sdk/client-s3";

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: process.env.SPACES_ENDPOINT!,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY!,
    secretAccessKey: process.env.SPACES_SECRET_KEY!,
  },
});

export { s3Client };
