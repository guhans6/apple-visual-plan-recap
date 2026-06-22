import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PlanContentRenderer } from "@/components/plan/PlanContentRenderer";
import type { PlanContent } from "@shared/plan-content";
import {
  companionFeedbackQueryKey,
  companionPlanQueryKey,
  useUpdateCompanionFeedback,
} from "@/hooks/use-companion-plan";
import { CompanionWorkspaceShell } from "./CompanionWorkspaceShell";
import { buildCompanionWorkspaceModel } from "./companion-shell";

const EMPTY_PLAN_CONTENT: PlanContent = { version: 2, blocks: [] };

type CompanionArtifactEditorProps = {
  slug: string;
  kind: "plan" | "recap";
  plan: Parameters<typeof buildCompanionWorkspaceModel>[0]["plan"];
  feedback: Parameters<typeof buildCompanionWorkspaceModel>[0]["feedback"];
};

type CompanionFeedbackItem = {
  id?: string | null;
  message?: string | null;
  status?: string | null;
  resolutionTarget?: string | null;
  targetStatus?: string | null;
  target?: {
    title?: string | null;
    id?: string | null;
  } | null;
};

export function CompanionArtifactEditor({
  slug,
  kind,
  plan,
  feedback,
}: CompanionArtifactEditorProps) {
  const model = buildCompanionWorkspaceModel({
    slug,
    kind,
    plan,
    feedback,
  });
  const artifact = (plan?.plan ?? null) as
    | {
        title?: string;
        brief?: string;
        content?: PlanContent | null;
      }
    | null;
  const title =
    artifact?.title?.trim() ||
    (kind === "recap" ? "Untitled recap" : "Untitled plan");
  const brief = artifact?.brief?.trim() || "";
  const content = artifact?.content ?? EMPTY_PLAN_CONTENT;
  const feedbackItems = [
    ...((feedback as { pending?: CompanionFeedbackItem[] } | null)?.pending ?? []),
    ...((feedback as { secondary?: CompanionFeedbackItem[] } | null)?.secondary ?? []),
  ];

  return (
    <CompanionWorkspaceShell model={model}>
      <div className="grid min-h-0 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main
          data-testid="companion-artifact-editor"
          className="mx-auto flex w-full max-w-6xl flex-col gap-6"
        >
          <section className="rounded-3xl border border-border/60 bg-background/92 p-6 shadow-sm backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {kind === "recap" ? "Recap artifact" : "Plan artifact"}
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">
              {title}
            </h1>
            {brief ? (
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {brief}
              </p>
            ) : null}
          </section>
          <section className="rounded-3xl border border-border/60 bg-background/98 p-6 shadow-sm">
            <PlanContentRenderer
              content={content}
              fallbackTitle={title}
              fallbackBrief={brief}
              editingDisabled
              isRecap={kind === "recap"}
            />
          </section>
        </main>
        <CompanionReviewSidebar
          slug={slug}
          kind={kind}
          items={feedbackItems}
          repoPath={(plan as { repoPath?: string | null } | null)?.repoPath}
        />
      </div>
    </CompanionWorkspaceShell>
  );
}

function CompanionReviewSidebar({
  slug,
  kind,
  repoPath,
  items,
}: {
  slug: string;
  kind: "plan" | "recap";
  repoPath?: string | null;
  items: CompanionFeedbackItem[];
}) {
  const [message, setMessage] = useState("");
  const [resolutionTarget, setResolutionTarget] = useState<"agent" | "human">(
    "agent",
  );
  const queryClient = useQueryClient();
  const updateFeedback = useUpdateCompanionFeedback();

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    const selectedText =
      typeof window === "undefined" ? "" : window.getSelection()?.toString().trim();
    const anchor = selectedText
      ? JSON.stringify({
          anchorKind: "text",
          targetKind: "text",
          textQuote: selectedText,
          targetLabel: "Selected text",
          resolutionTarget,
        })
      : JSON.stringify({
          anchorKind: "point",
          targetKind: "block",
          targetLabel: "Document comment",
          resolutionTarget,
        });
    await updateFeedback.mutateAsync({
      slug,
      ...(repoPath ? { path: repoPath } : {}),
      comments: [
        {
          id: createFeedbackId(),
          anchor,
          message: trimmed,
          resolutionTarget,
          createdBy: "human",
        },
      ],
    });
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: companionPlanQueryKey(slug, kind, repoPath),
      }),
      queryClient.invalidateQueries({
        queryKey: companionFeedbackQueryKey(slug, repoPath),
      }),
    ]);
    setMessage("");
  }

  return (
    <aside
      data-testid="companion-review-sidebar"
      className="flex max-h-[calc(100vh-10rem)] min-h-[520px] flex-col rounded-3xl border border-border/60 bg-background/95 p-4 shadow-sm"
      aria-labelledby="companion-review-sidebar-title"
    >
      <div className="border-b border-border/60 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Review
        </p>
        <h2
          id="companion-review-sidebar-title"
          className="mt-2 text-sm font-semibold text-foreground"
        >
          Review comments
        </h2>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-3">
        {items.length > 0 ? (
          items.map((item) => (
            <article
              key={item.id ?? item.message}
              className="rounded-2xl border border-border/60 bg-muted/25 p-3"
            >
              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span>{item.status ?? "open"}</span>
                <span>{item.resolutionTarget ?? "agent"}</span>
                {item.targetStatus ? <span>{item.targetStatus}</span> : null}
              </div>
              <p className="mt-2 text-sm text-foreground">
                {item.message ?? "Untitled feedback"}
              </p>
              {item.target?.title || item.target?.id ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.target.title ?? item.target.id}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border/60 p-3 text-sm text-muted-foreground">
            No review comments yet.
          </p>
        )}
      </div>
      <form className="border-t border-border/60 pt-3" onSubmit={submitComment}>
        <label
          htmlFor="companion-comment-message"
          className="text-xs font-medium text-foreground"
        >
          Comment on selected text
        </label>
        <textarea
          id="companion-comment-message"
          className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          placeholder="Leave a comment for the next agent..."
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <select
            className="rounded-xl border border-border bg-background px-2 py-1 text-xs text-foreground"
            value={resolutionTarget}
            onChange={(event) =>
              setResolutionTarget(event.currentTarget.value as "agent" | "human")
            }
            aria-label="Resolution target"
          >
            <option value="agent">Agent action</option>
            <option value="human">Human note</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50"
            disabled={!message.trim() || updateFeedback.isPending}
          >
            Add comment
          </button>
        </div>
      </form>
    </aside>
  );
}

function createFeedbackId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `fb_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }
  return `fb_${Date.now().toString(36)}`;
}
