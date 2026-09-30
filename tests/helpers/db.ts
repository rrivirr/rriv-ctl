import db, { type Data } from "../../src/db/db.ts";

export interface SeededUser {
  email: string;
  env: string;
}

/** Seeds a signed-in user (and the selected environment) into the local db. */
export const seedUser = (
  overrides: {
    email?: string;
    env?: "local" | "dev" | "staging" | "prod";
    accessToken?: string;
    expirationTime?: number;
    serialPortPath?: string;
    deviceId?: string;
    context?: Data["context"];
    deviceContext?: Data["deviceContext"];
    toSync?: Data["toSync"];
  } = {},
): SeededUser => {
  const email = overrides.email ?? "tester@rriv.org";
  const env = overrides.env ?? "prod";

  const user: Data = {
    name: "Tester",
    accessToken: overrides.accessToken ?? "access-token",
    expirationTime: overrides.expirationTime ?? Date.now() + 3_600_000,
    context: overrides.context ?? { id: "", name: "" },
    device: {
      id: overrides.deviceId ?? "",
      uniqueName: "",
      serialNumber: "",
      serialPortPath: overrides.serialPortPath ?? "/dev/ttyTEST",
    },
    deviceContext: overrides.deviceContext ?? {
      contextId: "",
      deviceId: "",
      assignedDeviceName: "",
    },
    toSync: overrides.toSync ?? [],
    lastLoginAt: new Date(),
    currentLoginAt: new Date(),
  };

  db.update((data) => {
    data.environment = {
      name: env,
      config: {
        RRIV_API_URL: "http://rriv-api.test",
        KEYCLOAK_URL: "http://keycloak.test/token",
        KEYCLOAK_CLIENT_ID: "rrivctl",
        DATA_API_URL: "http://data-api.test",
        MQTT_URL: "mqtt://mqtt.test",
        ADMIN_EMAIL: "admin@rriv.org",
      },
    };
    data.activeEmail = email;
    data[email] = { [env]: user };
  });

  return { email, env };
};

/** Clears the active user so `getLoggedInUser()` returns nothing. */
export const clearActiveUser = (): void => {
  db.update((data) => {
    data.activeEmail = "";
  });
};
