import axios from "axios";
import { randomUUID } from "crypto";
import {
  createDeviceContext,
  getDeviceContext,
  updateDeviceContext,
} from "./device-context.ts";

jest.mock("axios");

describe("DeviceContext API Calls", () => {
  const axiosGetMock = axios.get as jest.MockedFunction<typeof axios.get>;
  const axiosPostMock = axios.post as jest.MockedFunction<typeof axios.post>;
  const axiosPatchMock = axios.patch as jest.MockedFunction<typeof axios.patch>;
  process.env.RRIV_API_URL = "http://rriv-api.com";

  it("createDeviceContext", async () => {
    const accessToken = randomUUID();
    const assignedDeviceName = randomUUID();
    const contextId = randomUUID();
    const deviceId = randomUUID();

    const result = await createDeviceContext({
      accessToken,
      assignedDeviceName,
      contextId,
      deviceId,
    });
    expect(result).toEqual(undefined);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv-api.com/context/${contextId}/device/${deviceId}`,
      { assignedDeviceName },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });

  it("getDeviceContext", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();
    const deviceId = randomUUID();
    const contextId = randomUUID();

    const result = await getDeviceContext({ accessToken, deviceId, contextId });
    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv-api.com/context/${contextId}/device/${deviceId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });

  it("updateDeviceContext", async () => {
    const accessToken = randomUUID();
    const contextId = randomUUID();
    const deviceId = randomUUID();

    const result = await updateDeviceContext({
      accessToken,
      deviceId,
      contextId,
      end: true,
    });
    expect(result).toEqual(undefined);
    expect(axiosPatchMock).toHaveBeenCalledTimes(1);
    expect(axiosPatchMock).toHaveBeenCalledWith(
      `http://rriv-api.com/context/${contextId}/device/${deviceId}`,
      { end: true },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });
});
