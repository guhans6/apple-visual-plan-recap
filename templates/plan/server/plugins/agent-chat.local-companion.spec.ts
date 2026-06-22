import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@agent-native/core/server");
});

describe("local companion agent-chat plugin", () => {
  it("delegates to the core agent chat plugin so action routes still mount", async () => {
    const runner = vi.fn();
    const createAgentChatPlugin = vi.fn(() => runner);
    vi.doMock("@agent-native/core/server", () => ({
      createAgentChatPlugin,
    }));

    const plugin = await import("./agent-chat.js");
    const nitroApp = {};

    await plugin.default(nitroApp as never);

    expect(createAgentChatPlugin).toHaveBeenCalledOnce();
    expect(runner).toHaveBeenCalledWith(nitroApp);
  });
});
