import axios from "axios";
import { randomUUID } from "crypto";
import {
  getActiveConfigSnapshot,
  getConfigHistory,
  getConfigSnapshots,
  getLibraryConfigSnapshotById,
  getLibraryConfigSnapshots,
  saveConfigSnapshot,
  overwriteConfigSnapshot,
  publishNewConfigSnapshotLibrary,
  publishNewConfigSnapshotLibraryVersion,
} from "./config-snapshot.ts";

jest.mock("axios");

describe("ConfigSnapshot API calls", () => {
  const axiosGetMock = axios.get as jest.MockedFunction<typeof axios.get>;
  const axiosPutMock = axios.put as jest.MockedFunction<typeof axios.put>;
  const axiosPostMock = axios.post as jest.MockedFunction<typeof axios.post>;
  process.env.RRIV_API_URL = "http://rriv.api.url";

  it("getActiveConfigSnapshot", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const contextId = randomUUID();
    const deviceId = randomUUID();
    const accessToken = randomUUID();
    const result = await getActiveConfigSnapshot({
      deviceId,
      contextId,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/active?deviceId=${deviceId}&contextId=${contextId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("getConfigHistory", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const contextId = randomUUID();
    const deviceId = randomUUID();
    const accessToken = randomUUID();
    const result = await getConfigHistory({
      deviceId,
      contextId,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/history?deviceId=${deviceId}&contextId=${contextId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("getConfigSnapshots", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const search = randomUUID();
    const name = randomUUID();
    const accessToken = randomUUID();
    const result = await getConfigSnapshots({
      name,
      search,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: { name, search },
      }
    );
  });

  it("getLibraryConfigSnapshotById", async () => {
    const resultMock = [{ name: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const libraryConfigSnapshotId = randomUUID();
    const accessToken = randomUUID();
    const result = await getLibraryConfigSnapshotById({
      libraryConfigSnapshotId,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/libraryConfig/${libraryConfigSnapshotId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("getLibraryConfigSnapshots", async () => {
    const resultMock = [{ name: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const name = randomUUID();
    const search = randomUUID();
    const accessToken = randomUUID();
    const result = await getLibraryConfigSnapshots({
      isPublic: false,
      name,
      search,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/libraryConfig`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          name,
          search,
          isPublic: false,
        },
      }
    );
  });

  it("saveConfigSnapshot", async () => {
    const name = randomUUID();
    const contextId = randomUUID();
    const deviceId = randomUUID();
    const accessToken = randomUUID();
    const result = await saveConfigSnapshot({
      name,
      accessToken,
      contextId,
      deviceId,
    });

    expect(result).toEqual(undefined);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/save`,
      {
        name,
        contextId,
        deviceId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("overwriteConfigSnapshot", async () => {
    const dataloggerConfigId = randomUUID();
    const sensorConfigIds = [randomUUID(), randomUUID()];
    const contextId = randomUUID();
    const deviceId = randomUUID();
    const accessToken = randomUUID();
    const createdAt = new Date().toISOString();
    const result = await overwriteConfigSnapshot({
      accessToken,
      dataloggerConfigId,
      sensorConfigIds,
      deviceId,
      contextId,
      createdAt,
    });

    expect(result).toEqual(undefined);
    expect(axiosPutMock).toHaveBeenCalledTimes(1);
    expect(axiosPutMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/active`,
      {
        dataloggerConfigId,
        sensorConfigIds,
        deviceId,
        contextId,
        createdAt,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("publishNewConfigSnapshotLibrary", async () => {
    const name = randomUUID();
    const description = randomUUID();
    const contextId = randomUUID();
    const deviceId = randomUUID();
    const accessToken = randomUUID();
    const result = await publishNewConfigSnapshotLibrary({
      name,
      description,
      accessToken,
      configSnapshot: {
        contextId,
        deviceId,
      },
    });

    expect(result).toEqual(undefined);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/libraryConfig`,
      {
        name,
        description,
        contextId,
        deviceId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("publishNewConfigSnapshotLibraryVersion", async () => {
    const libraryConfigSnapshotId = randomUUID();
    const description = randomUUID();
    const contextId = randomUUID();
    const deviceId = randomUUID();
    const accessToken = randomUUID();
    const result = await publishNewConfigSnapshotLibraryVersion({
      libraryConfigSnapshotId,
      description,
      accessToken,
      configSnapshot: {
        contextId,
        deviceId,
      },
    });

    expect(result).toEqual(undefined);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.url/configSnapshot/libraryConfig/${libraryConfigSnapshotId}/version`,
      {
        description,
        contextId,
        deviceId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });
});
