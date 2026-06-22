type CompanionKind = "plan" | "recap";

type CompanionPlanData = {
  plan?: {
    title?: string | null;
    content?: {
      blocks?: Array<{ id?: string | null }>;
    } | null;
  } | null;
  summary?: {
    openCommentCount?: number | null;
  } | null;
  events?: Array<{ type?: string | null }> | null;
  companionManifest?: {
    targets?: Array<{ id?: string | null }> | null;
    reviewPacks?: Array<{
      id?: string | null;
      title?: string | null;
      items?: Array<{
        id?: string | null;
        title?: string | null;
        status?: string | null;
        detail?: string | null;
      }> | null;
    }> | null;
  } | null;
  companionFeedback?: {
    ordered?: Array<{
      id?: string | null;
      status?: string | null;
      changedAt?: string | null;
      changedBy?: string | null;
      resolutionSummary?: string | null;
      changedFiles?: string[] | null;
      evidenceRefs?: string[] | null;
      commitOrDiffRef?: string | null;
    }> | null;
  } | null;
  companionEvidence?: {
    packets?: Array<{
      evidenceId?: string | null;
      kind?: string | null;
      status?: string | null;
      summary?: string | null;
      feedbackIds?: string[] | null;
      planTargetIds?: string[] | null;
      command?: string | null;
      artifactPath?: string | null;
      note?: string | null;
    }> | null;
    summary?: {
      verifiedCount?: number | null;
      assumedCount?: number | null;
      unverifiedCount?: number | null;
    } | null;
  } | null;
  recapCoverage?: {
    summary?: {
      statusCounts?: Record<string, number | undefined> | null;
    } | null;
    links?: Array<{
      recapBlockId?: string | null;
      status?: string | null;
      planTargetIds?: string[] | null;
      feedbackIds?: string[] | null;
      evidenceIds?: string[] | null;
      note?: string | null;
    }> | null;
  } | null;
  repoPath?: string | null;
  folder?: string | null;
} | null;

type CompanionFeedbackData = {
  pending?: Array<unknown> | null;
} | null;

export type CompanionWorkspaceCard = {
  id: "feedback" | "context" | "history" | "evidence";
  title: string;
  eyebrow: string;
  summary: string;
  detail: string;
};

export type CompanionWorkspaceModel = {
  kind: CompanionKind;
  title: string;
  subtitle: string;
  cards: CompanionWorkspaceCard[];
  reviewPackItems: Array<{
    id: string;
    title: string;
    status: string;
    detail: string;
  }>;
  importedResults: Array<{
    id: string;
    status: string;
    changedAt?: string;
    changedBy?: string;
    resolutionSummary?: string;
    changedFiles: string[];
    evidenceRefs: string[];
    commitOrDiffRef?: string;
  }>;
  evidencePackets: Array<{
    evidenceId: string;
    kind: string;
    status: string;
    summary: string;
    feedbackIds: string[];
    planTargetIds: string[];
    command?: string;
    artifactPath?: string;
    note?: string;
  }>;
  recapLinks: Array<{
    recapBlockId: string;
    status: string;
    planTargetIds: string[];
    feedbackIds: string[];
    evidenceIds: string[];
    note?: string;
  }>;
};

export function buildCompanionWorkspaceModel(input: {
  slug: string;
  kind: CompanionKind;
  plan: CompanionPlanData;
  feedback: CompanionFeedbackData;
}): CompanionWorkspaceModel {
  const plan = input.plan;
  const blockCount = plan?.plan?.content?.blocks?.length ?? 0;
  const targetCount = plan?.companionManifest?.targets?.length ?? 0;
  const eventCount = plan?.events?.length ?? 0;
  const pendingFeedbackCount = input.feedback?.pending?.length ?? 0;
  const openCommentCount = plan?.summary?.openCommentCount ?? 0;
  const statusCounts = plan?.recapCoverage?.summary?.statusCounts ?? {};
  const verifiedCount = statusCounts.verified ?? 0;
  const deferredCount = statusCounts.deferred ?? 0;
  const explicitEvidenceSummary = plan?.companionEvidence?.summary ?? null;
  const companionVerifiedCount = explicitEvidenceSummary?.verifiedCount ?? 0;
  const companionAssumedCount = explicitEvidenceSummary?.assumedCount ?? 0;
  const companionUnverifiedCount =
    explicitEvidenceSummary?.unverifiedCount ?? 0;
  const kindLabel =
    input.kind === "recap" ? "Recap workspace" : "Plan workspace";
  const title = plan?.plan?.title?.trim() || input.slug;
  const subtitle =
    plan?.folder?.trim() ||
    plan?.repoPath?.trim() ||
    `Companion: ${input.slug}`;
  const evidencePackets =
    plan?.companionEvidence?.packets
      ?.filter(
        (
          packet,
        ): packet is NonNullable<
          NonNullable<CompanionPlanData>["companionEvidence"]
        >["packets"][number] =>
          Boolean(
            packet?.evidenceId &&
            packet.kind &&
            packet.status &&
            packet.summary,
          ),
      )
      .map((packet) => ({
        evidenceId: packet.evidenceId ?? "",
        kind: packet.kind ?? "",
        status: packet.status ?? "",
        summary: packet.summary ?? "",
        feedbackIds: packet.feedbackIds ?? [],
        planTargetIds: packet.planTargetIds ?? [],
        command: packet.command ?? undefined,
        artifactPath: packet.artifactPath ?? undefined,
        note: packet.note ?? undefined,
      })) ?? [];
  const recapLinks =
    plan?.recapCoverage?.links
      ?.filter(
        (link): link is NonNullable<CompanionPlanData>["recapCoverage"]["links"][number] =>
          Boolean(link?.recapBlockId && link.status),
      )
      .map((link) => ({
        recapBlockId: link.recapBlockId ?? "",
        status: link.status ?? "",
        planTargetIds: link.planTargetIds ?? [],
        feedbackIds: link.feedbackIds ?? [],
        evidenceIds: link.evidenceIds ?? [],
        note: link.note ?? undefined,
      })) ?? [];
  const evidenceLinkCount =
    evidencePackets.length > 0
      ? evidencePackets.length
      : (plan?.recapCoverage?.links?.reduce((count, link) => {
          return count + (link.evidenceIds?.length ?? 0);
        }, 0) ?? targetCount);
  const reviewPackItems =
    plan?.companionManifest?.reviewPacks
      ?.flatMap((pack) => pack.items ?? [])
      .filter(
        (item): item is {
          id?: string | null;
          title?: string | null;
          status?: string | null;
          detail?: string | null;
        } => Boolean(item?.id && item.title && item.status && item.detail),
      )
      .map((item) => ({
        id: item.id ?? "",
        title: item.title ?? "",
        status: item.status ?? "",
        detail: item.detail ?? "",
      })) ?? [];
  const importedResults =
    plan?.companionFeedback?.ordered
      ?.filter(
        (item) =>
          Boolean(item?.id && item.status) &&
          Boolean(
            item?.resolutionSummary ||
              item?.changedFiles?.length ||
              item?.evidenceRefs?.length ||
              item?.commitOrDiffRef,
          ),
      )
      .map((item) => ({
        id: item.id ?? "",
        status: item.status ?? "",
        changedAt: item.changedAt ?? undefined,
        changedBy: item.changedBy ?? undefined,
        resolutionSummary: item.resolutionSummary ?? undefined,
        changedFiles: item.changedFiles ?? [],
        evidenceRefs: item.evidenceRefs ?? [],
        commitOrDiffRef: item.commitOrDiffRef ?? undefined,
      })) ?? [];

  return {
    kind: input.kind,
    title,
    subtitle,
    reviewPackItems,
    importedResults,
    evidencePackets,
    recapLinks,
    cards: [
      {
        id: "feedback",
        title: "Feedback",
        eyebrow: `${pendingFeedbackCount} pending`,
        summary: `${openCommentCount} open comment${openCommentCount === 1 ? "" : "s"}`,
        detail:
          pendingFeedbackCount > 0
            ? "Agent-targeted review work is ready to hand off."
            : "No pending agent-targeted feedback right now.",
      },
      {
        id: "context",
        title: "Context",
        eyebrow: `${blockCount} block${blockCount === 1 ? "" : "s"}`,
        summary: `${targetCount} mapped target${targetCount === 1 ? "" : "s"}`,
        detail: kindLabel,
      },
      {
        id: "history",
        title: "History",
        eyebrow: `${eventCount} event${eventCount === 1 ? "" : "s"}`,
        summary:
          eventCount > 0
            ? "Feedback lifecycle is preserved in the local review log."
            : "No review-history events have been recorded yet.",
        detail:
          plan?.events?.[eventCount - 1]?.type?.trim() ||
          "Awaiting the first review action.",
      },
      {
        id: "evidence",
        title: "Evidence",
        eyebrow: `${evidenceLinkCount} linked proof item${evidenceLinkCount === 1 ? "" : "s"}`,
        summary:
          input.kind === "recap"
            ? `${verifiedCount} verified, ${deferredCount} deferred`
            : evidencePackets.length > 0
              ? `${companionVerifiedCount} verified, ${companionAssumedCount} assumed, ${companionUnverifiedCount} unverified`
              : `${targetCount} source-linked review target${targetCount === 1 ? "" : "s"}`,
        detail:
          input.kind === "recap"
            ? "Recap proof stays tied to plan targets and review feedback."
            : "Evidence remains local, inspectable, and source-linked.",
      },
    ],
  };
}
