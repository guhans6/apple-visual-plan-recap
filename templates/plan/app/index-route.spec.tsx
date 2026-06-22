import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/pages/CompanionHomePage", () => ({
  CompanionHomePage: () => <div>companion-dashboard</div>,
}));

import IndexPage from "./routes/_index";

describe("index route", () => {
  it("renders the companion dashboard at the root route", () => {
    const html = renderToStaticMarkup(<IndexPage />);

    expect(html).toContain("companion-dashboard");
  });
});
