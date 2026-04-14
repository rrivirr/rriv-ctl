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
} from "../../modules/context/device-context.service.ts";

export const createAction = async (name: string) => {
  await createContext(name);
};

export const useAction = async (name: string) => {
  await useContext(name);
};

export const deleteAction = async (name: string) => {
  await deleteContext(name);
};

export const endContextAction = async (name?: string) => {
  await endContext(name);
};

export const listContextAction = async (options: any) => {
  await listContexts(options);
};

export const endDeviceContextAction = async () => {
  await endDeviceContext();
};

export const listDeviceContextAction = async () => {
  await listContextDevices();
};
