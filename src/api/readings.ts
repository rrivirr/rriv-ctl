import axios from "axios";
import stream from "stream/promises";
import fs from "fs";
import { getConfig } from "../util/config.ts";
import { errorHandler } from "../util/error-handler.ts";

export const getReadings = async (query: {
  eui: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  fileName?: string | boolean;
}): Promise<string | undefined> => {
  const { eui, limit, fileName, startDate, endDate } = query;
  try {
    const config = getConfig();
    const response = await axios.get(`${config.DATA_API_URL}/readings/${eui}`, {
      params: {
        rangeStart: startDate,
        rangeEnd: endDate,
        format: fileName ? "csv" : "json",
        limit: limit || (!fileName ? 10 : undefined),
      },
      ...(fileName && { responseType: "stream" }),
    });
    if (fileName) {
      const contentDisposition = response.headers["content-disposition"];
      const defaultFilename = contentDisposition.split("=")[1];
      const file = (
        fileName !== true ? `${fileName}.csv` : defaultFilename
      ).replaceAll(/:|-/g, "_");

      const finishedDownload = stream.finished;
      const writer = fs.createWriteStream(file);

      response.data.pipe(writer);
      await finishedDownload(writer);
      return file;
    } else {
      console.log(response.data);
      if (!limit) {
        console.log("\ndata has been limited to 10 records");
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response?.data) {
      const errorStream = error.response.data;
      let errorData = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorStream.on("data", (chunk: any) => {
        errorData += chunk.toString();
      });

      errorStream.on("end", async () => {
        console.error(errorData);
        console.error(JSON.parse(errorData));
        await errorHandler({ error: errorData, doNothing: true });
      });
    } else {
      console.log(error);
      console.log(error?.toJSON().code || error?.message);
      await errorHandler({ error, doNothing: true });
    }
    return ``;
  }
};
