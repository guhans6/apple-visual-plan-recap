import { describe, expect, it } from "vitest";

import { PLAN_CONNECTOR_CATALOG } from "./lib/plan-connector-catalog";

const PR_VISUAL_RECAP_MCP_TOOLS = [
  "get-plan-blocks",
  "create-visual-recap",
] as const;

describe("Plan MCP PR visual recap catalog", () => {
  it("includes the PR visual recap tools in the curated catalog", () => {
    expect(PLAN_CONNECTOR_CATALOG).toEqual(
      expect.arrayContaining([...PR_VISUAL_RECAP_MCP_TOOLS]),
    );
  });
});
