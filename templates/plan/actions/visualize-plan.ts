import { defineAction } from "@agent-native/core";
import {
  getRequestOrgId,
  getRequestUserEmail,
} from "@agent-native/core/server/request-context";
import { z } from "zod";
import { getDb, schema } from "../server/db/index.js";
import {
  createPlanContentFromSections,
  serializePlanContent,
} from "../server/plan-content.js";
import {
  isLocalPlanRuntime,
  resolvePlanOrgIdForWrite,
  requirePlanOwnerEmailForWrite,
} from "../server/lib/local-identity.js";
import { assertGuestCreateWithinLimits } from "../server/lib/guest-abuse.js";
import { writePlanLocalFiles } from "../server/lib/local-plan-files.js";
import {
  buildPlanHtml,
  deriveSectionsFromText,
  loadPlanBundle,
  newId,
  nowIso,
  planPath,
  planSourceSchema,
  writeEvent,
} from "../server/plans.js";

function inferTitle(planText: string): string {
  const firstHeading = planText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^#{1,3}\s+\S/.test(line));
  if (firstHeading) return firstHeading.replace(/^#{1,3}\s+/, "").slice(0, 90);
  const firstLine = planText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine ? firstLine.slice(0, 90) : "Imported visual plan";
}

export default defineAction({
  description:
    "Convert an existing Codex, Claude Code, Markdown, or pasted text plan into an Agent-Native visual plan with editable rich blocks, sketch diagrams/wireframes, implementation maps, code previews, and annotation space.",
  agentTool: false,
  schema: z.object({
    title: z.string().optional().describe("Short title for the visual plan"),
    brief: z
      .string()
      .optional()
      .describe("Brief of the existing plan; defaults to the imported text"),
    goal: z.string().optional().describe("Compatibility alias for brief"),
    planText: z
      .string()
      .min(1)
      .describe("Existing Codex, Claude Code, Markdown, or pasted plan text"),
    source: planSourceSchema.optional().default("imported"),
    repoPath: z.string().optional().describe("Repository path for the run"),
    currentFocus: z.string().optional().default("visual review"),
  }),
  run: async (args) => {
    const requesterEmail = getRequestUserEmail();
    const ownerEmail = requirePlanOwnerEmailForWrite(
      requesterEmail,
      "Visualizing a plan",
    );
    const ownerOrgId = resolvePlanOrgIdForWrite(
      requesterEmail,
      getRequestOrgId(),
    );
    await assertGuestCreateWithinLimits(ownerEmail);
    const id = newId("plan");
    const now = nowIso();
    const title = args.title || inferTitle(args.planText);
    const brief =
      args.brief ||
      args.goal ||
      `Visual companion for an imported coding-agent plan.`;
    const sections = deriveSectionsFromText(args.planText);
    const content = createPlanContentFromSections({
      title,
      brief,
      sections: sections.map((section, index) => ({
        id: `section-${index + 1}`,
        type: section.type,
        title: section.title,
        body: section.body,
        html: section.html,
      })),
    });

    await getDb()
      .insert(schema.plans)
      .values({
        id,
        title,
        brief,
        status: "review",
        source: args.source,
        repoPath: args.repoPath ?? null,
        currentFocus: args.currentFocus ?? "visual review",
        html: null,
        markdown: args.planText,
        content: serializePlanContent(content),
        createdAt: now,
        updatedAt: now,
        approvedAt: null,
        ownerEmail,
        orgId: ownerOrgId,
        visibility: "private",
      });

    await getDb()
      .insert(schema.planSections)
      .values(
        sections.map((section) => ({
          id: newId("sec"),
          planId: id,
          type: section.type,
          title: section.title,
          body: section.body,
          html: section.html ?? null,
          order: section.order,
          createdBy: section.createdBy,
          createdAt: now,
          updatedAt: now,
        })),
      );

    await writeEvent({
      planId: id,
      type: "plan.imported",
      message: "Imported text plan for visual review.",
      payload: {
        source: args.source,
        textLength: args.planText.length,
      },
      createdBy: "import",
    });

    const bundle = await loadPlanBundle(id);
    const local = isLocalPlanRuntime()
      ? await writePlanLocalFiles({
          planId: id,
          title: bundle.plan.title,
          brief: bundle.plan.brief,
          content: bundle.plan.content,
          kind: bundle.plan.kind,
          url: planPath(id),
        })
      : null;
    const detailPath = local?.written ? local.routePath : planPath(id);
    return {
      ...bundle,
      planId: id,
      html: buildPlanHtml(bundle),
      path: detailPath,
      url: detailPath,
      ...(local?.written ? { localFiles: local } : {}),
      fallbackInstructions:
        "Open the companion artifact, react to the editable visual sections, add comments or corrections, then read the pending companion feedback queue before continuing. Keep the artifact in repo-local companion files unless the user explicitly asks for a separate export or selection receipt.",
    };
  },
  link: ({ result }) => {
    const url = (result as { url?: string } | null)?.url;
    if (!url) return null;
    return {
      url,
      label: "Open Plan",
      view: "plan",
    };
  },
});
