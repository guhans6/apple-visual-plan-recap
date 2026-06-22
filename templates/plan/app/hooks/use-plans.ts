import { useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import type { RefObject } from "react";
import { toast } from "sonner";
import { useActionMutation, useActionQuery } from "@agent-native/core/client";
import type { PlanMdxFolder } from "@/lib/desktop-plan-files";
import type {
  PlanAuthor,
  PlanBundle,
  PlanCommentKind,
  PlanCommentMention,
  PlanCommentResolutionTarget,
  PlanCommentStatus,
  PlanSectionType,
  PlanSource,
  PlanStatus,
  PlanSummary,
} from "@shared/types";
import type { PlanContent, PlanContentPatch } from "@shared/plan-content";

export type PlanSectionInput = {
  id?: string;
  type?: PlanSectionType;
  title: string;
  body?: string;
  html?: string;
  order?: number;
  createdBy?: PlanAuthor;
};

export type PlanCommentInput = {
  id?: string;
  parentCommentId?: string;
  sectionId?: string;
  kind?: PlanCommentKind;
  status?: PlanCommentStatus;
  anchor?: string;
  message: string;
  createdBy?: PlanAuthor;
  authorEmail?: string;
  authorName?: string;
  resolutionTarget?: PlanCommentResolutionTarget;
  mentions?: PlanCommentMention[];
  resolvedBy?: string | null;
  resolvedAt?: string | null;
};

export type CreatePlanInput = {
  title?: string;
  brief?: string;
  goal?: string;
  source?: PlanSource;
  repoPath?: string;
  currentFocus?: string;
  status?: PlanStatus;
  html?: string;
  content?: PlanContent;
  contentPatches?: PlanContentPatch[];
  markdown?: string;
  sections?: PlanSectionInput[];
  comments?: PlanCommentInput[];
};

export type CreateUiPlanInput = CreatePlanInput & {
  states?: Array<{ name: string; description: string }>;
  components?: Array<{ name: string; description: string }>;
  sketchiness?: number;
  implementationNotes?: string;
};

export type CreatePrototypePlanInput = CreatePlanInput & {
  screens?: Array<{
    id?: string;
    title: string;
    summary?: string;
    surface?: "desktop" | "mobile" | "popover" | "panel" | "browser";
    renderMode?: "wireframe" | "design";
    html?: string;
    css?: string;
    state?: Array<{ id?: string; label: string; value: string }>;
  }>;
  transitions?: Array<{
    id?: string;
    from: string;
    to: string;
    label?: string;
    trigger?: string;
  }>;
  implementationNotes?: string;
};

export type CreatePlanDesignInput = CreatePrototypePlanInput & {
  designMd?: string;
  brandKit?: Record<string, unknown>;
  codebaseStyles?: Record<string, unknown>;
  designNotes?: string;
};

export type VisualQuestionOptionInput = {
  value?: string;
  label: string;
  description?: string;
  recommended?: boolean;
  preview?: "desktop" | "mobile" | "split" | "flow" | "diagram";
  bullets?: string[];
};

export type VisualQuestionInput = {
  id: string;
  type: "single" | "multi" | "freeform" | "visual";
  title: string;
  subtitle?: string;
  options?: VisualQuestionOptionInput[];
  allowOther?: boolean;
  placeholder?: string;
  required?: boolean;
};

export type CreateVisualQuestionsInput = CreatePlanInput & {
  questions?: VisualQuestionInput[];
};

export type VisualizePlanInput = {
  title?: string;
  brief?: string;
  goal?: string;
  planText: string;
  source?: PlanSource;
  repoPath?: string;
  currentFocus?: string;
};

export type UpdatePlanInput = {
  planId: string;
  title?: string;
  brief?: string;
  status?: PlanStatus;
  currentFocus?: string;
  html?: string;
  content?: PlanContent;
  contentPatches?: PlanContentPatch[];
  markdown?: string;
  sections?: PlanSectionInput[];
  comments?: PlanCommentInput[];
  consumedCommentIds?: string[];
  note?: string;
};

export type UpdateLocalPlanInput = {
  slug: string;
  path?: string;
  title?: string;
  brief?: string;
  content?: PlanContent;
  contentPatches?: PlanContentPatch[];
  note?: string;
};

export type PromoteLocalPlanInput = {
  slug: string;
  path?: string;
  targetPath?: string;
  overwrite?: boolean;
};

export type UpdateLocalPlanFeedbackInput = {
  slug: string;
  comments: Array<{
    id: string;
    anchor?: string;
    message: string;
    resolutionTarget?: PlanCommentResolutionTarget;
    createdBy?: PlanAuthor;
  }>;
};

export type ResolveLocalPlanFeedbackInput = {
  slug: string;
  commentId: string;
  status: "resolved" | "open";
};

export type ConvertVisualPlanToPrototypeInput = {
  planId: string;
  title?: string;
  brief?: string;
  removeCanvas?: boolean;
};

export type ListPlansInput = {
  status?: PlanStatus;
  limit?: number;
  deleted?: "active" | "deleted" | "all";
};

export const ACTIVE_PLANS_QUERY_ARGS = {};
export const ACTIVE_PLANS_QUERY_KEY = [
  "action",
  "list-visual-plans",
  ACTIVE_PLANS_QUERY_ARGS,
] as const;
export const ALL_PLANS_QUERY_ARGS = { deleted: "all" as const };
export const ALL_PLANS_QUERY_KEY = [
  "action",
  "list-visual-plans",
  ALL_PLANS_QUERY_ARGS,
] as const;

function usePlanInvalidation() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["action", "list-visual-plans"] });
    void qc.invalidateQueries({ queryKey: ["action", "get-visual-plan"] });
    void qc.invalidateQueries({
      queryKey: ["action", "get-local-plan-folder"],
    });
    void qc.invalidateQueries({ queryKey: ["action", "get-plan-feedback"] });
  };
}

function showActionError(message: string) {
  return (error: Error) => {
    toast.error(
      error.message
        ? error.message.replace(/^Action [\w-]+ failed:\s*/, "")
        : message,
    );
  };
}

type UsePlansOptions = Omit<
  UseQueryOptions<PlanSummary[]>,
  "queryKey" | "queryFn"
>;

function isListPlansInput(value: unknown): value is ListPlansInput {
  if (!value || typeof value !== "object") return false;
  return "status" in value || "limit" in value || "deleted" in value;
}

export function usePlans(
  options?: UsePlansOptions,
): ReturnType<typeof useActionQuery<PlanSummary[]>>;
export function usePlans(
  args: ListPlansInput,
  options?: UsePlansOptions,
): ReturnType<typeof useActionQuery<PlanSummary[]>>;
export function usePlans(
  argsOrOptions?: ListPlansInput | UsePlansOptions,
  options?: UsePlansOptions,
) {
  const args = isListPlansInput(argsOrOptions)
    ? argsOrOptions
    : ACTIVE_PLANS_QUERY_ARGS;
  const queryOptions = isListPlansInput(argsOrOptions)
    ? options
    : (argsOrOptions as UsePlansOptions | undefined);
  return useActionQuery<PlanSummary[]>("list-visual-plans", args, queryOptions);
}

export function planBundleQueryParams(id: string) {
  return { id, includeMdx: false, includeHtml: true } as const;
}

export function planBundleQueryKey(id: string) {
  return ["action", "get-visual-plan", planBundleQueryParams(id)] as const;
}

export function localPlanBundleQueryParams(slug: string, path?: string | null) {
  return path ? ({ slug, path } as const) : ({ slug } as const);
}

export function localPlanBundleQueryKey(slug: string, path?: string | null) {
  return [
    "action",
    "get-local-plan-folder",
    localPlanBundleQueryParams(slug, path),
  ] as const;
}

export function usePlan(
  id?: string,
  pausePollRef?: RefObject<boolean> | { current: boolean },
) {
  return useActionQuery<PlanBundle & { html?: string }>(
    "get-visual-plan",
    planBundleQueryParams(id ?? ""),
    {
      enabled: !!id,
      // Pause the 3-second poll while a comment mutation is in-flight so
      // an optimistic comment inserted into the cache isn't evicted before
      // the server write commits (Issue 4a).
      refetchInterval: (query: { state: { status: string } }) => {
        if (query.state.status === "error") return false;
        if (pausePollRef?.current) return false;
        return 3_000;
      },
    },
  );
}

export function useCreatePlan() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & { path?: string; url?: string; html?: string },
    CreatePlanInput
  >("create-visual-plan", {
    onSuccess: invalidate,
    onError: showActionError("Failed to create visual plan"),
  });
}

export function useCreateUiPlan() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & { path?: string; url?: string; html?: string },
    CreateUiPlanInput
  >("create-ui-plan", {
    onSuccess: invalidate,
    onError: showActionError("Failed to create UI plan"),
  });
}

export function useCreatePrototypePlan() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & { path?: string; url?: string; html?: string },
    CreatePrototypePlanInput
  >("create-prototype-plan", {
    onSuccess: invalidate,
    onError: showActionError("Failed to create visual plan"),
  });
}

export function useCreatePlanDesign() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & { path?: string; url?: string; html?: string },
    CreatePlanDesignInput
  >("create-plan-design", {
    onSuccess: invalidate,
    onError: showActionError("Failed to create plan design"),
  });
}

export function useCreateVisualQuestions() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & { path?: string; url?: string; html?: string },
    CreateVisualQuestionsInput
  >("create-visual-questions", {
    onSuccess: invalidate,
    onError: showActionError("Failed to create visual questions"),
  });
}

export function useVisualizePlan() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & { path?: string; url?: string; html?: string },
    VisualizePlanInput
  >("visualize-plan", {
    onSuccess: invalidate,
    onError: showActionError("Failed to import plan"),
  });
}

export function useUpdatePlan() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<PlanBundle & { html?: string }, UpdatePlanInput>(
    "update-visual-plan",
    {
      onSuccess: invalidate,
      onError: showActionError("Failed to update visual plan"),
    },
  );
}

export function useUpdateLocalPlan() {
  const qc = useQueryClient();
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & {
      localOnly: true;
      slug: string;
      folder: string;
      repoPath?: string | null;
      suggestedRepoPath?: string;
      path?: string;
      url?: string;
      html?: string;
      mdx?: PlanMdxFolder;
      localFiles?: { written: boolean; folder: string; files: string[] };
    },
    UpdateLocalPlanInput
  >("update-local-plan-folder", {
    onSuccess: (data, variables) => {
      qc.setQueryData(
        localPlanBundleQueryKey(variables.slug, variables.path),
        data,
      );
      invalidate();
    },
    onError: showActionError("Failed to update local plan files"),
  });
}

export function usePromoteLocalPlan() {
  const qc = useQueryClient();
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & {
      localOnly: true;
      slug: string;
      folder: string;
      repoPath?: string | null;
      suggestedRepoPath?: string;
      targetPath?: string;
      alreadyPromoted?: boolean;
      path?: string;
      url?: string;
      html?: string;
      mdx?: PlanMdxFolder;
      localFiles?: { written: boolean; folder: string; files: string[] };
    },
    PromoteLocalPlanInput
  >("promote-local-plan-folder", {
    onSuccess: (data, variables) => {
      qc.setQueryData(
        localPlanBundleQueryKey(variables.slug, variables.path),
        data,
      );
      if (data.repoPath) {
        qc.setQueryData(
          localPlanBundleQueryKey(data.slug, data.repoPath),
          data,
        );
      }
      invalidate();
    },
    onError: showActionError("Failed to save local plan to repo"),
  });
}

/**
 * A separate mutation instance used exclusively for status changes
 * (draft / review / approved / in_progress / complete). Keeping it separate
 * from the prose-autosave `useUpdatePlan` instance avoids any bleed between
 * save-pending and status-pending states.
 */
export function useUpdatePlanStatus() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<PlanBundle & { html?: string }, UpdatePlanInput>(
    "update-visual-plan",
    {
      onSuccess: invalidate,
      onError: showActionError("Failed to update plan status"),
    },
  );
}

export function useUpdateLocalPlanFeedback() {
  return useActionMutation<
    PlanBundle & { html?: string },
    UpdateLocalPlanFeedbackInput
  >("update-local-plan-feedback", {
    onError: showActionError("Failed to update local plan feedback"),
  });
}

export function useResolveLocalPlanFeedback() {
  return useActionMutation<
    {
      slug: string;
      planId: string;
      commentId: string;
      status: "resolved" | "open";
      updatedAt: string;
    },
    ResolveLocalPlanFeedbackInput
  >("resolve-local-plan-feedback", {
    onError: showActionError("Failed to update local feedback status"),
  });
}

export function useConvertVisualPlanToPrototype() {
  const invalidate = usePlanInvalidation();
  return useActionMutation<
    PlanBundle & { html?: string; path?: string; url?: string },
    ConvertVisualPlanToPrototypeInput
  >("convert-visual-plan-to-prototype", {
    onSuccess: invalidate,
    onError: showActionError("Failed to convert plan to prototype"),
  });
}
