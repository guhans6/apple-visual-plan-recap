import { describe, expect, it, vi } from "vitest";

vi.mock("../server/lib/plan-meta.server", () => ({
  fetchPublicPlanMeta: vi.fn(),
}));

import { APP_TITLE } from "./lib/app-config";
import { meta as planMeta } from "./routes/companion.plans.$slug";
import { meta as recapMeta } from "./routes/companion.recaps.$slug";

type MetaEntry = Record<string, string>;

function titleFrom(entries: MetaEntry[]): string | undefined {
  return entries.find((entry) => "title" in entry)?.title;
}

function propertyFrom(
  entries: MetaEntry[],
  property: string,
): string | undefined {
  return entries.find((entry) => entry.property === property)?.content;
}

describe("plan detail route meta", () => {
  it("uses the shared app title for companion plans", () => {
    const entries = planMeta() as MetaEntry[];

    expect(titleFrom(entries)).toBe(APP_TITLE);
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "description",
          content: expect.stringContaining("local visual companion plan"),
        }),
      ]),
    );
  });

  it("uses the shared app title for companion recaps", () => {
    const entries = recapMeta() as MetaEntry[];

    expect(titleFrom(entries)).toBe(APP_TITLE);
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "description",
          content: expect.stringContaining("local visual companion recap"),
        }),
      ]),
    );
  });
});
