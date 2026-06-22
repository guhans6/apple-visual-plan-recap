import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client";

export type CompanionKind = "plan" | "recap";

export function companionPlanQueryParams(
  slug: string,
  kind: CompanionKind,
  path?: string | null,
) {
  return path ? ({ slug, kind, path } as const) : ({ slug, kind } as const);
}

export function companionPlanQueryKey(
  slug: string,
  kind: CompanionKind,
  path?: string | null,
) {
  return [
    "action",
    "get-companion-plan",
    companionPlanQueryParams(slug, kind, path),
  ] as const;
}

export function useCompanionPlan(
  slug: string,
  kind: CompanionKind,
  path?: string | null,
) {
  return useActionQuery(
    "get-companion-plan",
    companionPlanQueryParams(slug, kind, path),
    { enabled: Boolean(slug) },
  );
}

export function useCompanionFeedback(slug: string, path?: string | null) {
  return useActionQuery(
    "get-companion-feedback",
    path ? { slug, path } : { slug },
    { enabled: Boolean(slug) },
  );
}

export function useCompanionDashboard(includeAdditionalSources = false) {
  return useActionQuery(
    "list-companion-dashboard",
    { includeAdditionalSources },
    { enabled: true },
  );
}

export function useUpdateCompanionFeedback() {
  return useActionMutation("update-companion-feedback", {});
}

export function useResolveCompanionFeedback() {
  return useActionMutation("resolve-companion-feedback", {});
}

export function useConsumeCompanionFeedback() {
  return useActionMutation("consume-companion-feedback", {});
}
