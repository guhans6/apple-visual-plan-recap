import { defineAction } from "@agent-native/core";
import { z } from "zod";
import { listLocalCompanionDashboard } from "../server/lib/local-companion-dashboard.js";

export default defineAction({
  description:
    "List current-project companion plans and recaps for the dashboard homepage.",
  schema: z.object({
    includeAdditionalSources: z
      .preprocess((value) => {
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
      }, z.boolean().optional())
      .optional(),
  }),
  http: { method: "GET" },
  requiresAuth: false,
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: false,
    title: "List Companion Dashboard",
    description:
      "List the current project's companion plans and recaps for the dashboard homepage.",
  },
  run: async (args) => {
    return listLocalCompanionDashboard({
      includeAdditionalSources: args.includeAdditionalSources,
    });
  },
});
