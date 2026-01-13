import * as AWS from "@aws-sdk/client-s3";

export const s3Client = new AWS.S3({
  forcePathStyle: false,
  endpoint: process.env.SPACES_ENDPOINT!,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY!,
    secretAccessKey: process.env.SPACES_SECRET_KEY!,
  },
});

export const GetObjectCommand = AWS.GetObjectCommand;
