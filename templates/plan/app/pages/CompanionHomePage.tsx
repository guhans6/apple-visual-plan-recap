import { useState } from "react";
import { useCompanionDashboard } from "@/hooks/use-companion-plan";

export function CompanionHomePage() {
  const [showOtherSources, setShowOtherSources] = useState(false);
  const dashboard = useCompanionDashboard(showOtherSources);

  if (dashboard.error) {
    const message =
      dashboard.error instanceof Error
        ? dashboard.error.message
        : "Unknown dashboard error.";
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <section className="rounded-xl border border-destructive/30 bg-card p-6">
          <h1 className="text-lg font-semibold text-foreground">
            Couldn&apos;t load the companion dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </section>
      </main>
    );
  }

  const project = dashboard.data?.currentProject;
  if (!project) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <section className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Loading the companion dashboard.
          </p>
        </section>
      </main>
    );
  }

  const hasArtifacts = project.plans.length > 0 || project.recaps.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <section className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">
          Current project
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Companion dashboard
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{project.repoRoot}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {project.companionRoot}
        </p>
      </section>

      {!hasArtifacts ? (
        <section className="rounded-xl border border-dashed border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            No companion artifacts yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This project stores plans and recaps under{" "}
            {project.companionRoot}.
          </p>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Plans</h2>
        {renderArtifactList(project.plans, "No plans yet.")}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Recaps</h2>
        {renderArtifactList(project.recaps, "No recaps yet.")}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Other sources
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep artifacts from other workspaces separate from the current
              project unless you intentionally open them.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground"
            onClick={() => setShowOtherSources((value) => !value)}
          >
            {showOtherSources ? "Hide other sources" : "Show other sources"}
          </button>
        </div>
        {showOtherSources ? (
          <div className="mt-4 text-sm text-muted-foreground">
            {dashboard.data?.additionalSources.length ? (
              dashboard.data.additionalSources.map((source) => (
                <div key={source.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium text-foreground">{source.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {source.plans.length} plans, {source.recaps.length} recaps
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Plans
                      </p>
                      {renderArtifactList(source.plans, "No plans in this source.")}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Recaps
                      </p>
                      {renderArtifactList(
                        source.recaps,
                        "No recaps in this source.",
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No other sources configured.</p>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function renderArtifactList(
  entries: Array<{
    slug: string;
    title: string;
    routePath: string;
    repoPath: string;
  }>,
  emptyLabel: string,
) {
  if (entries.length === 0) {
    return <p className="mt-4 text-sm text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <a
            href={entry.routePath}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {entry.title}
          </a>
          <p className="text-sm text-muted-foreground">{entry.repoPath}</p>
        </li>
      ))}
    </ul>
  );
}
