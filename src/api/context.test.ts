import axios from "axios";
import { randomUUID } from "crypto";
import {
  createContext,
  getContextByName,
  getContexts,
  deleteContext,
  updateContext,
} from "./context.ts";

jest.mock("axios");

describe("Context API Calls", () => {
  const axiosGetMock = axios.get as jest.MockedFunction<typeof axios.get>;
  const axiosPatchMock = axios.patch as jest.MockedFunction<typeof axios.patch>;
  const axiosDeleteMock = axios.delete as jest.MockedFunction<
    typeof axios.delete
  >;
  const axiosPostMock = axios.post as jest.MockedFunction<typeof axios.post>;
  process.env.RRIV_API_URL = "http://rriv.api.url.com";

  it("createContext", async () => {
    const resultMock = { id: randomUUID(), context: "new" };
    axiosPostMock.mockResolvedValue({ data: resultMock });
    const name = randomUUID();
    const accessToken = randomUUID();
    const result = await createContext({
      contextName: name,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosPostMock).toHaveBeenCalledTimes(1);
    expect(axiosPostMock).toHaveBeenCalledWith(
      `http://rriv.api.url.com/context`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("getContextByName", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const name = randomUUID();
    const accessToken = randomUUID();
    const result = await getContextByName({
      contextName: name,
      accessToken,
    });

    expect(result).toEqual(resultMock[0]);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.url.com/context?name=${name}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("getContexts", async () => {
    const resultMock = [{ id: randomUUID() }];
    axiosGetMock.mockResolvedValue({ data: resultMock });
    const name = randomUUID();
    const search = randomUUID();
    const accessToken = randomUUID();
    const result = await getContexts({
      name,
      search,
      ended: true,
      accessToken,
    });

    expect(result).toEqual(resultMock);
    expect(axiosGetMock).toHaveBeenCalledTimes(1);
    expect(axiosGetMock).toHaveBeenCalledWith(
      `http://rriv.api.url.com/context`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          name,
          search,
          ended: true,
        },
      }
    );
  });

  it("deleteContext", async () => {
    const id = randomUUID();
    const accessToken = randomUUID();
    const result = await deleteContext({
      id,
      accessToken,
    });

    expect(result).toEqual(undefined);
    expect(axiosDeleteMock).toHaveBeenCalledTimes(1);
    expect(axiosDeleteMock).toHaveBeenCalledWith(
      `http://rriv.api.url.com/context/${id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });

  it("updateContext", async () => {
    const id = randomUUID();
    const accessToken = randomUUID();
    const result = await updateContext({
      id,
      end: true,
      accessToken,
    });

    expect(result).toEqual(undefined);
    expect(axiosPatchMock).toHaveBeenCalledTimes(1);
    expect(axiosPatchMock).toHaveBeenCalledWith(
      `http://rriv.api.url.com/context/${id}`,
      { end: true },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  });
});
