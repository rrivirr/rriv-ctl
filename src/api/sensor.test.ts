import axios from "axios";
import { randomUUID } from "crypto";
import {
  getSensorDrivers,
  getSensorLibraryConfig,
  getSensorLibraryConfigById,
  publishNewSensorLibraryConfig,
  publishNewSensorLibraryConfigVersion,
  createSensorConfig,
} from "./sensor.ts";

jest.mock("axios");

describe("Sensor API Calls", () => {
  const axiosGetMock = axios.get as jest.MockedFunction<typeof axios.get>;
  const axiosPostMock = axios.post as jest.MockedFunction<typeof axios.post>;
  process.env.RRIV_API_URL = "http://rriv.api.com";

  it("getSensorDrivers", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();

    const result = await getSensorDrivers({ accessToken });
    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.com/sensor/driver`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });

  it("getSensorLibraryConfig", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();
    const name = randomUUID();
    const search = randomUUID();
    const isPublic = false;

    const result = await getSensorLibraryConfig({
      accessToken,
      name,
      search,
      isPublic,
    });
    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.com/sensor/libraryConfig`,
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

  it("getSensorLibraryConfigById", async () => {
    const resultMock = { id: randomUUID() };
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();
    const sensorLibraryId = randomUUID();

    const result = await getSensorLibraryConfigById({
      sensorLibraryId,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.com/sensor/libraryConfig/${sensorLibraryId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  });

  it("publishNewSensorLibraryConfig", async () => {
    const name = randomUUID();
    const description = randomUUID();
    const sensorConfigId = randomUUID();
    const accessToken = randomUUID();

    const result = await publishNewSensorLibraryConfig({
      name,
      description,
      sensorConfigId,
      accessToken,
    });
    expect(result).toBeUndefined();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.com/sensor/libraryConfig`,
      { name, description, sensorConfigId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  });

  it("publishNewSensorLibraryConfigVersion", async () => {
    const sensorLibraryId = randomUUID();
    const description = randomUUID();
    const sensorConfigId = randomUUID();
    const accessToken = randomUUID();

    const result = await publishNewSensorLibraryConfigVersion({
      sensorLibraryId,
      description,
      sensorConfigId,
      accessToken,
    });
    expect(result).toBeUndefined();
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.com/sensor/libraryConfig/${sensorLibraryId}/version`,
      { description, sensorConfigId },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  });

  it("createSensorConfig", async () => {
    const sensorDriverId = randomUUID();
    const deviceId = randomUUID();
    const contextId = randomUUID();
    const accessToken = randomUUID();
    const createdAt = new Date().toISOString();
    const config = { sensor: "config" };
    const name = "sensor";
    const singlePropertyChange = false;

    const result = await createSensorConfig({
      sensorDriverId,
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
      `http://rriv.api.com/sensor/config`,
      {
        name,
        sensorDriverId,
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
