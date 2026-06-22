import { PlanContentRenderer } from "@/components/plan/PlanContentRenderer";
import type { PlanContent } from "@shared/plan-content";
import { CompanionWorkspaceShell } from "./CompanionWorkspaceShell";
import { buildCompanionWorkspaceModel } from "./companion-shell";

const EMPTY_PLAN_CONTENT: PlanContent = { blocks: [] };

type CompanionArtifactEditorProps = {
  slug: string;
  kind: "plan" | "recap";
  plan: Parameters<typeof buildCompanionWorkspaceModel>[0]["plan"];
  feedback: Parameters<typeof buildCompanionWorkspaceModel>[0]["feedback"];
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
  const artifact = plan?.plan;
  const title =
    artifact?.title?.trim() || (kind === "recap" ? "Untitled recap" : "Untitled plan");
  const brief = artifact?.brief?.trim() || "";
  const content = artifact?.content ?? EMPTY_PLAN_CONTENT;

  return (
    <CompanionWorkspaceShell model={model}>
      <main
        data-testid="companion-artifact-editor"
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8"
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
    </CompanionWorkspaceShell>
  );
}
