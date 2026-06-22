import { describe, expect, it } from "vitest";
import collabPlugin, { COLLAB_PLUGIN_DISABLED } from "./plugins/collab.js";

describe("collab plugin surface", () => {
  it("keeps the plugin stem present while disabling realtime collab", () => {
    expect(COLLAB_PLUGIN_DISABLED).toBe(true);
    expect(typeof collabPlugin).toBe("function");
    expect(collabPlugin()).toBeUndefined();
  });
});
