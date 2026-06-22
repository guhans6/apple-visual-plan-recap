import {
  companionRoutePath,
  inferCompanionRouteKind,
} from "../../shared/companion-routes";

export interface NavigationStateRoute {
  view: "plans" | "plan";
  planId?: string;
  localPlanSlug?: string;
  localPlanPath?: string;
}

export function isCompanionPlanPath(pathname: string) {
  return pathname.startsWith("/companion/plans/");
}

export function isCompanionRecapPath(pathname: string) {
  return pathname.startsWith("/companion/recaps/");
}

export function isCompanionDetailPath(pathname: string) {
  return isCompanionPlanPath(pathname) || isCompanionRecapPath(pathname);
}

export function viewForPath(pathname: string): NavigationStateRoute["view"] {
  return isCompanionDetailPath(pathname) ? "plan" : "plans";
}

export function routeStateForLocation(
  pathname: string,
  search: string,
): NavigationStateRoute {
  const state: NavigationStateRoute = {
    view: viewForPath(pathname),
  };
  const companionMatch = pathname.match(/^\/companion\/(plans|recaps)\/([^/]+)/);
  if (companionMatch) {
    const slug = decodeURIComponent(companionMatch[2] ?? "");
    state.planId = `local-${slug}`;
    state.localPlanSlug = slug;
    const localPath = new URLSearchParams(search).get("path");
    if (localPath) state.localPlanPath = localPath;
  }
  return state;
}

export function companionPathForLocalArtifact(
  slug: string,
  localPlanPath?: string,
): string {
  return companionRoutePath(inferCompanionRouteKind(localPlanPath), slug, localPlanPath);
}
