export type CompanionRecapCoverageStatus =
  | "implemented"
  | "verified"
  | "deferred"
  | "missing";

export interface CompanionRecapCoverageLink {
  recapBlockId: string;
  status: CompanionRecapCoverageStatus;
  planTargetIds: string[];
  feedbackIds: string[];
  evidenceIds: string[];
  note?: string;
}

export interface CompanionRecapCoverage {
  links: CompanionRecapCoverageLink[];
}

export function summarizeCompanionRecapCoverage(
  coverage: CompanionRecapCoverage | null | undefined,
): {
  links: CompanionRecapCoverageLink[];
  summary: {
    statusCounts: Record<CompanionRecapCoverageStatus, number>;
  };
} | null {
  if (!coverage) return null;

  const statusCounts: Record<CompanionRecapCoverageStatus, number> = {
    implemented: 0,
    verified: 0,
    deferred: 0,
    missing: 0,
  };

  for (const link of coverage.links) {
    statusCounts[link.status] += 1;
  }

  return {
    links: coverage.links,
    summary: {
      statusCounts,
    },
  };
}
