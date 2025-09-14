import axios from "axios";
import { randomUUID } from "crypto";
import {
  getDataloggerDrivers,
  getDataloggerLibraryConfig,
  getDataloggerLibraryConfigById,
  publishNewDataloggerLibraryConfig,
  publishNewDataloggerLibraryConfigVersion,
  createDataloggerConfig,
} from "./datalogger.ts";

jest.mock("axios");

describe("Datalogger API Calls", () => {
  const axiosGetMock = axios.get as jest.MockedFunction<typeof axios.get>;
  const axiosPostMock = axios.post as jest.MockedFunction<typeof axios.post>;
  process.env.RRIV_API_URL = "http://rriv.api.com";

  it("getDataloggerDrivers", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();

    const result = await getDataloggerDrivers({ accessToken });
    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.com/datalogger/driver`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });

  it("getDataloggerLibraryConfig", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();
    const name = randomUUID();
    const search = randomUUID();
    const isPublic = false;

    const result = await getDataloggerLibraryConfig({
      accessToken,
      name,
      search,
      isPublic,
    });
    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.com/datalogger/libraryConfig`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          name,
          search,
          isPublic,
        },
      }
    );
  });

  it("getDataloggerLibraryConfigById", async () => {
    const resultMock = { id: randomUUID() };
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();
    const dataloggerLibraryId = randomUUID();

    const result = await getDataloggerLibraryConfigById({
      dataloggerLibraryId,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.com/datalogger/libraryConfig/${dataloggerLibraryId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  });

  it("publishNewDataloggerLibraryConfig", async () => {
    const name = randomUUID();
    const description = randomUUID();
    const deviceId = randomUUID();
    const contextId = randomUUID();
    const accessToken = randomUUID();

    const result = await publishNewDataloggerLibraryConfig({
      name,
      description,
      deviceId,
      contextId,
      accessToken,
    });
    expect(result).toBeUndefined();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.com/datalogger/libraryConfig`,
      { name, description, deviceId, contextId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  });

  it("publishNewDataloggerLibraryConfigVersion", async () => {
    const dataloggerLibraryId = randomUUID();
    const description = randomUUID();
    const deviceId = randomUUID();
    const contextId = randomUUID();
    const accessToken = randomUUID();

    const result = await publishNewDataloggerLibraryConfigVersion({
      dataloggerLibraryId,
      description,
      contextId,
      deviceId,
      accessToken,
    });
    expect(result).toBeUndefined();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.com/datalogger/libraryConfig/${dataloggerLibraryId}/version`,
      { description, deviceId, contextId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  });

  it("createDataloggerConfig", async () => {
    const dataloggerDriverId = randomUUID();
    const deviceId = randomUUID();
    const contextId = randomUUID();
    const accessToken = randomUUID();
    const createdAt = new Date().toISOString();
    const config = { data: "logger" };
    const name = "datalogger";
    const singlePropertyChange = false;

    const result = await createDataloggerConfig({
      dataloggerDriverId,
      deviceId,
      contextId,
      createdAt,
      config,
      singlePropertyChange,
      name,
      accessToken,
    });
    expect(result).toBeUndefined();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.com/datalogger/config`,
      {
        name,
        dataloggerDriverId,
        deviceId,
        contextId,
        createdAt,
        config,
        singlePropertyChange,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  });
});
