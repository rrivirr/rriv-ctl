import axios from "axios";
import { randomUUID } from "crypto";
import { getDevice, bindDevice } from "./device.ts";

jest.mock("axios");

describe("Device API Calls", () => {
  const axiosGetMock = axios.get as jest.MockedFunction<typeof axios.get>;
  const axiosPostMock = axios.post as jest.MockedFunction<typeof axios.post>;
  process.env.RRIV_API_URL = "http://rriv-api.com";

  it("bindDevice", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosPostMock.mockResolvedValue({ data: resultMock });
    const accessToken = randomUUID();
    const uniqueName = randomUUID();
    const serialNumber = randomUUID();

    const result = await bindDevice({
      accessToken,
      uniqueName,
      serialNumber,
    });
    expect(result).toEqual(resultMock);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv-api.com/device/${serialNumber}/bind`,
      { uniqueName },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });

  it("getDevice; id", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const id = randomUUID();
    const serialNumber = randomUUID();
    const accessToken = randomUUID();

    const result = await getDevice({ accessToken, id, serialNumber });
    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv-api.com/device?id=${id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });

  it("getDevice; serialNumber", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const serialNumber = randomUUID();
    const accessToken = randomUUID();

    const result = await getDevice({ accessToken, serialNumber });
    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv-api.com/device?serialNumber=${serialNumber}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });
});
