import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// `db/db.ts` computes its directory and opens the JSON store at import time, so
// point HOME at a throwaway dir before any module is loaded.
const home = mkdtempSync(path.join(tmpdir(), "rrivctl-test-"));
process.env.HOME = home;
process.env.USERPROFILE = home;

// Fallback config used by modules that read `util/config.ts` at import time.
process.env.RRIV_API_URL = "http://rriv-api.test";
process.env.KEYCLOAK_URL = "http://keycloak.test/token";
process.env.KEYCLOAK_CLIENT_ID = "rrivctl";
process.env.DATA_API_URL = "http://data-api.test";
process.env.MQTT_URL = "mqtt://mqtt.test";
process.env.ADMIN_EMAIL = "admin@rriv.org";
process.env.SPACES_ENDPOINT = "http://spaces.test";
process.env.SPACES_ACCESS_KEY = "test-access-key";
process.env.SPACES_SECRET_KEY = "test-secret-key";
