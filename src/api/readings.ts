import axios from "axios";
import stream from "stream/promises";
import fs from "fs";
import { getConfig } from "../util/config.ts";

export const getReadings = async (query: {
  id: string;
  dirPath: string;
  startDate?: string;
  endDate?: string;
}): Promise<string> => {
  const { id, dirPath, startDate, endDate } = query;
  try {
    const config = getConfig();
    const response = await axios.get(`${config.DATA_API_URL}/readings/${id}`, {
      params: { rangeStart: startDate, rangeEnd: endDate, format: "csv" },
      responseType: "stream",
    });

    const contentDisposition = response.headers["content-disposition"];
    const filename = contentDisposition.split("=")[1];
    const file = `${dirPath}/${filename}`;

    const finishedDownload = stream.finished;
    const writer = fs.createWriteStream(file);

    response.data.pipe(writer);
    await finishedDownload(writer);
    return file;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response?.data) {
      const errorStream = error.response.data;
      let errorData = "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorStream.on("data", (chunk: any) => {
        errorData += chunk.toString();
      });

      errorStream.on("end", () => {
        console.error(errorData);
        console.error(JSON.parse(errorData));
      });
    } else {
      console.log(error);
      console.log(error?.toJSON().code || error?.message);
    }
    return ``;
  }
};
