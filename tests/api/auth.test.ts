import { describe, expect, it, vi } from "vitest";

const axiosMock = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("axios", () => ({ default: { post: axiosMock.post } }));

import { login } from "../../src/api/auth.ts";
import { seedUser } from "../helpers/db.ts";

describe("api/auth login", () => {
  it("posts a password grant and returns the token", async () => {
    seedUser({ env: "local" });
    axiosMock.post.mockResolvedValue({
      data: { access_token: "tok", expires_in: 300 },
    });

    const result = await login({ username: "a@rriv.org", password: "pw" });

    expect(result).toEqual({ accessToken: "tok", expiresIn: 300 });
    expect(axiosMock.post).toHaveBeenCalledTimes(1);

    const [url, body, options] = axiosMock.post.mock.calls[0];
    expect(url).toBe("http://keycloak.test/token");
    expect(body).toMatchObject({
      client_id: "rrivctl",
      username: "a@rriv.org",
      password: "pw",
      grant_type: "password",
    });
    expect(options.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
  });
});
