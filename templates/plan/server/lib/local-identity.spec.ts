import { afterEach, describe, expect, it } from "vitest";

const savedNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = savedNodeEnv;
});

describe("isLocalPlanRuntime", () => {
  it("uses non-production as the companion runtime gate", async () => {
    process.env.NODE_ENV = "test";
    const { isLocalPlanRuntime } = await import("./local-identity.js");

    expect(isLocalPlanRuntime()).toBe(true);

    process.env.NODE_ENV = "production";
    expect(isLocalPlanRuntime()).toBe(false);
  });
});
