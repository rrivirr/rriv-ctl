import {
  createContext,
  useContext,
  endContext,
  listContexts,
  deleteContext,
} from "../../modules/context/context.service.ts";
import {
  endDeviceContext,
  listContextDevices,
  renameDeviceInContext,
} from "../../modules/context/device-context.service.ts";
import { oraPromise } from "../../util/ora-promise.ts";

export const createAction = async (name: string) => {
  await oraPromise(() => createContext(name));
};

export const useAction = async (name: string) => {
  await oraPromise(() => useContext(name));
};

export const deleteAction = async (name: string) => {
  await oraPromise(() => deleteContext(name));
};

export const endContextAction = async (name?: string) => {
  await oraPromise(() => endContext(name));
};

export const listContextAction = async (options: any) => {
  await oraPromise(() => listContexts(options));
};

export const endDeviceContextAction = async () => {
  await oraPromise(endDeviceContext);
};

export const listDeviceContextAction = async () => {
  await oraPromise(listContextDevices);
};

export const renameDeviceInContextAction = async (name: string) => {
  await oraPromise(() => renameDeviceInContext(name));
};
