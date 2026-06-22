export type CompanionRouteKind = "plan" | "recap";

export function companionRoutePath(
  kind: CompanionRouteKind,
  slug: string,
  repoPath?: string | null,
): string {
  const prefix = kind === "recap" ? "/companion/recaps" : "/companion/plans";
  const base = `${prefix}/${encodeURIComponent(slug)}`;
  if (!repoPath) return base;
  return `${base}?${new URLSearchParams({ path: repoPath }).toString()}`;
}

export function inferCompanionRouteKind(
  repoPath?: string | null,
): CompanionRouteKind {
  if (!repoPath) return "plan";
  const normalized = repoPath.toLowerCase();
  return normalized.includes("/recaps/") || normalized.startsWith("recaps/")
    ? "recap"
    : "plan";
}
