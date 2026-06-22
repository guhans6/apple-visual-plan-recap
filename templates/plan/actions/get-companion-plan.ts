import { defineAction } from "@agent-native/core";
import { z } from "zod";
import { exportPlanContentToMdxFolder } from "../server/plan-mdx.js";
import { buildPlanHtml, nowIso } from "../server/plans.js";
import { readCompanionEvidence } from "../server/lib/companion-evidence.js";
import {
  replayCompanionFeedbackEvents,
  type CompanionFeedbackEvent,
} from "../server/lib/companion-feedback.js";
import {
  buildCompanionManifest,
  readCompanionManifest,
} from "../server/lib/companion-manifest.js";
import { summarizeCompanionRecapCoverage } from "../server/lib/companion-recap-coverage.js";
import {
  getLocalPlanOwnerEmail,
  isLocalPlanRuntime,
} from "../server/lib/local-identity.js";
import { readLocalPlanFeedback } from "../server/lib/local-plan-feedback.js";
import { readPlanLocalFolder } from "../server/lib/local-plan-files.js";
import { companionRoutePath } from "../shared/companion-routes.js";
import type { PlanBundle, PlanKind } from "../shared/types.js";

const companionKindSchema = z.enum(["plan", "recap"]);

export default defineAction({
  description:
    "Read a local visual companion plan or recap folder with feedback and target manifest metadata.",
  schema: z.object({
    slug: z
      .string()
      .min(1)
      .regex(/^[A-Za-z0-9._-]+$/),
    path: z.string().optional(),
    kind: companionKindSchema.optional(),
  }),
  http: { method: "GET" },
  requiresAuth: false,
  readOnly: true,
  publicAgent: {
    expose: true,
    readOnly: true,
    requiresAuth: false,
    title: "Get Companion Plan",
    description:
      "Read a local-first visual companion plan or recap with structured target metadata.",
  },
  run: async (args) => {
    if (!isLocalPlanRuntime()) {
      throw new Error(
        "Visual companion local folders are only available in local Plan runtime.",
      );
    }

    const local = await readPlanLocalFolder({
      slug: args.slug,
      path: args.path,
    });
    const kind = (args.kind ?? resolveLocalPlanKind(local.mdx)) as PlanKind;
    const planId = `local-${local.slug}`;
    const feedback = await readLocalPlanFeedback({
      planId,
      slug: local.slug,
      folder: local.folder,
    });
    const companionEvidence = await readCompanionEvidence(local.folder);
    const companionManifest =
      (await readCompanionManifest(local.folder)) ??
      (await buildCompanionManifest({
        folder: local.folder,
        slug: local.slug,
        kind,
        content: local.content,
        sourceFiles: local.mdx,
      }));
    const companionFeedback = replayCompanionFeedbackEvents(
      feedback.events
        .map((event) => event.payload?.feedbackEvent)
        .filter(isCompanionFeedbackEvent),
    );
    const now = nowIso();
    const title = local.content.title || args.slug;
    const brief = local.content.brief || "Local visual companion.";
    const companionPath = companionRoutePath(kind, local.slug, local.repoPath);
    const bundle: PlanBundle = {
      plan: {
        id: planId,
        title,
        brief,
        kind,
        status: "review",
        source: "imported",
        repoPath: local.folder,
        currentFocus: "local visual companion",
        html: null,
        markdown: local.mdx["plan.mdx"],
        content: local.content,
        createdAt: now,
        updatedAt: now,
        approvedAt: null,
      },
      access: {
        role: "viewer",
        ownerEmail: getLocalPlanOwnerEmail(),
        orgId: null,
        visibility: "private",
      },
      sections: [],
      comments: feedback.comments,
      events: feedback.events,
      summary: {
        sectionCounts: {},
        commentCount: feedback.summary.commentCount,
        openCommentCount: feedback.summary.openCommentCount,
      },
    };

    return {
      ...bundle,
      planId,
      companionManifest,
      companionEvidence,
      companionFeedback,
      recapCoverage: summarizeCompanionRecapCoverage(
        companionManifest.recapCoverage,
      ),
      localOnly: true,
      slug: local.slug,
      folder: local.folder,
      repoPath: local.repoPath,
      path: companionPath,
      url: companionPath,
      suggestedRepoPath: local.suggestedRepoPath,
      html: buildPlanHtml(bundle),
      mdx: await exportPlanContentToMdxFolder({
        content: bundle.plan.content,
        title: bundle.plan.title,
        brief: bundle.plan.brief,
        planId: bundle.plan.id,
        url: companionPath,
      }),
    };
  },
  link: ({ args }) => ({
    url: companionRoutePath(args.kind ?? "plan", args.slug, args.path),
    label:
      args.kind === "recap" ? "Open Companion Recap" : "Open Companion Plan",
    view: "plan",
  }),
});

function isCompanionFeedbackEvent(
  event: unknown,
): event is CompanionFeedbackEvent {
  return Boolean(
    event &&
      typeof event === "object" &&
      "type" in event &&
      typeof (event as { type?: unknown }).type === "string" &&
      "id" in event &&
      typeof (event as { id?: unknown }).id === "string",
  );
}

function resolveLocalPlanKind(mdx: {
  "plan.mdx": string;
  ".plan-state.json"?: string;
}): "plan" | "recap" {
  const frontmatterMatch = mdx["plan.mdx"].match(
    /^---[\s\S]*?^kind:\s*["']?(plan|recap)["']?\s*$/m,
  );
  if (frontmatterMatch) return frontmatterMatch[1] as "plan" | "recap";
  try {
    const state = mdx[".plan-state.json"]
      ? (JSON.parse(mdx[".plan-state.json"]) as { kind?: unknown })
      : null;
    if (state?.kind === "plan" || state?.kind === "recap") return state.kind;
  } catch {
    // Optional state file.
  }
  return "plan";
}
