import {
  useCompanionFeedback,
  useCompanionPlan,
} from "@/hooks/use-companion-plan";
import { CompanionArtifactEditor } from "./CompanionArtifactEditor";
import { localPlanLoadErrorCopy } from "./companion-page-shared";

export function CompanionArtifactPage({
  slug,
  kind,
  repoPath,
}: {
  slug: string;
  kind: "plan" | "recap";
  repoPath?: string | null;
}) {
  const plan = useCompanionPlan(slug, kind, repoPath);
  const feedback = useCompanionFeedback(slug, repoPath);
  if (plan.isError && !plan.data) {
    const copy = localPlanLoadErrorCopy({
      slug,
      error: plan.error,
      companionKind: kind,
    });
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <section className="rounded-xl border border-destructive/30 bg-card p-6">
          <h1 className="text-lg font-semibold text-foreground">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{copy.message}</p>
        </section>
      </main>
    );
  }

  return (
    <CompanionArtifactEditor
      slug={slug}
      kind={kind}
      plan={plan.data ?? null}
      feedback={feedback.data ?? null}
    />
  );
}
