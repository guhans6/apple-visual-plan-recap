import { afterEach, describe, expect, it, vi } from "vitest";

const savedNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = savedNodeEnv;
  vi.resetModules();
});

describe("local companion auth surface", () => {
  it(
    "keeps the auth plugin stem present but disables hosted auth behavior",
    async () => {
    process.env.NODE_ENV = "development";
    vi.resetModules();

    const auth = await import("./auth.js");
    const agentChat = await import("./agent-chat.js");

    expect(auth.AUTH_PLUGIN_DISABLED).toBe(true);
    expect(auth.WORKSPACE_APP_PUBLIC_PATHS).toEqual([]);
    expect(auth.LOCAL_MODE_ACTION_PATHS).toEqual([]);
    expect(auth.PUBLIC_AGENT_CHAT_PATHS).toEqual([]);
    expect(agentChat.AGENT_CHAT_PLUGIN_DISABLED).toBe(false);
    expect(agentChat.LOCAL_COMPANION_AGENT_CHAT_PATH).toBe(
      "/_agent-native/local-companion-agent-chat",
    );
    },
    15_000,
  );

  it("404s hosted auth endpoints while leaving ordinary local requests alone", async () => {
    vi.resetModules();

    const { default: authMiddleware } = await import("../middleware/auth.js");

    await expect(
      authMiddleware({
        node: { req: { url: "/_agent-native/sign-in" } },
        path: "/_agent-native/sign-in",
      } as never),
    ).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: "Not Found",
    });

    await expect(
      authMiddleware({
        node: { req: { url: "/companion?tab=review" } },
        path: "/companion",
      } as never),
    ).resolves.toBeUndefined();
  });
});
