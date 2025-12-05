import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../infra/s3.ts";
import { Environment } from "../types.ts";
import db from "../db/db.ts";

export const getConfig = () => {
  const data = db.data;
  const environment = data?.environment;
  if (environment?.name && environment?.config) {
    return environment.config;
  }
  return {
    RRIV_API_URL: process.env.RRIV_API_URL!,
    KEYCLOAK_URL: process.env.KEYCLOAK_URL!,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID!,
    DATA_API_URL: process.env.DATA_API_URL!,
  };
};

export const setConfig = async (env: Environment) => {
  const data = db.data;
  if (data.environment?.name === env) {
    console.log(`already in the ${env} environment`);
    return;
  }
  const Key = `${env}.json`;
  const r = await s3Client.send(
    new GetObjectCommand({
      Bucket: "rriv-envs",
      Key,
    })
  );
  const body = await r.Body?.transformToString();
  const config = JSON.parse(body!);
  db.update((data) => {
    data.environment = { name: env, config };
  });
  console.log(`successfully set to the ${env} environment`);
};
