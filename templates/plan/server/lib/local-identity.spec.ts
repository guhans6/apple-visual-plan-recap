import { afterEach, describe, expect, it } from "vitest";

const savedNodeEnv = process.env.NODE_ENV;
const savedPlanLocalMode = process.env.PLAN_LOCAL_MODE;

afterEach(() => {
  if (savedNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = savedNodeEnv;
  if (savedPlanLocalMode === undefined) delete process.env.PLAN_LOCAL_MODE;
  else process.env.PLAN_LOCAL_MODE = savedPlanLocalMode;
});

describe("isLocalPlanRuntime", () => {
  it("ignores legacy PLAN_LOCAL_MODE toggles outside production", async () => {
    process.env.NODE_ENV = "test";
    process.env.PLAN_LOCAL_MODE = "0";
    const { isLocalPlanRuntime } = await import("./local-identity.js");

    expect(isLocalPlanRuntime()).toBe(true);

    process.env.NODE_ENV = "production";
    process.env.PLAN_LOCAL_MODE = "1";
    expect(isLocalPlanRuntime()).toBe(false);
  });
});
