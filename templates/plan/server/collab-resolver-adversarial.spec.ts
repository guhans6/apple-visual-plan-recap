import { describe, expect, it } from "vitest";
import * as collabModule from "./plugins/collab.js";

describe("collab plugin disabled boundary", () => {
  it("exposes no resolver helper once realtime collab is removed", () => {
    expect(collabModule.COLLAB_PLUGIN_DISABLED).toBe(true);
    expect(collabModule.default).toBeTypeOf("function");
    expect("resolvePlanIdFromCollabDocId" in collabModule).toBe(false);
  });

  it("remains a no-op even when called with an arbitrary Nitro app object", () => {
    expect(collabModule.default()).toBeUndefined();
  });
});
