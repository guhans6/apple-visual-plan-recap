import { afterEach, describe, expect, it, vi } from "vitest";

const savedNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = savedNodeEnv;
  vi.resetModules();
  vi.doUnmock("@agent-native/core/db");
});

describe("plan db plugin in local companion mode", () => {
  it(
    "skips migrations in the default companion runtime",
    async () => {
    const runMigrations = vi.fn(() => vi.fn());
    vi.doMock("@agent-native/core/db", () => ({ runMigrations }));
    process.env.NODE_ENV = "test";

    const plugin = await import("./db.js");
    const nitroApp = {};

    await expect(plugin.default(nitroApp as never)).resolves.toBeUndefined();
    expect(runMigrations).not.toHaveBeenCalled();
    },
    15_000,
  );

  it("runs the normal migrations in production", async () => {
    const runner = vi.fn();
    const runMigrations = vi.fn(() => runner);
    vi.doMock("@agent-native/core/db", () => ({ runMigrations }));
    process.env.NODE_ENV = "production";

    const plugin = await import("./db.js");
    const nitroApp = {};

    await plugin.default(nitroApp as never);

    expect(runMigrations.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(runner).toHaveBeenCalledWith(nitroApp);
  });
});
