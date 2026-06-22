import type { PropsWithChildren } from "react";
import type {
  CompanionWorkspaceCard,
  CompanionWorkspaceModel,
} from "./companion-shell";

function CompanionWorkspaceCardView({
  card,
}: {
  card: CompanionWorkspaceCard;
}) {
  return (
    <section
      className="rounded-3xl border border-border/60 bg-background/92 p-4 shadow-sm backdrop-blur"
      aria-labelledby={`companion-card-${card.id}`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {card.eyebrow}
      </div>
      <h2
        id={`companion-card-${card.id}`}
        className="mt-2 text-sm font-semibold text-foreground"
      >
        {card.title}
      </h2>
      <p className="mt-2 text-sm text-foreground">{card.summary}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {card.detail}
      </p>
    </section>
  );
}

function CompanionEvidencePacketList({
  model,
}: {
  model: CompanionWorkspaceModel;
}) {
  if (model.evidencePackets.length === 0) return null;

  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Evidence review
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Structured proof packets stay linked to feedback threads and review
            targets.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {model.evidencePackets.map((packet) => (
            <article
              key={packet.evidenceId}
              className="rounded-3xl border border-border/60 bg-background/92 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-border/60 px-2 py-1 font-medium text-foreground">
                  {packet.kind}
                </span>
                <span className="rounded-full border border-border/60 px-2 py-1 font-medium text-muted-foreground">
                  {packet.status}
                </span>
                <span className="text-muted-foreground">
                  {packet.evidenceId}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground">{packet.summary}</p>
              {packet.command ? (
                <p className="mt-3 break-words rounded-2xl bg-muted/60 px-3 py-2 font-mono text-xs text-foreground">
                  {packet.command}
                </p>
              ) : null}
              {packet.note ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {packet.note}
                </p>
              ) : null}
              {packet.artifactPath ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Artifact: {packet.artifactPath}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {packet.feedbackIds.map((feedbackId) => (
                  <span
                    key={feedbackId}
                    className="rounded-full bg-muted px-2 py-1"
                  >
                    {feedbackId}
                  </span>
                ))}
                {packet.planTargetIds.map((targetId) => (
                  <span
                    key={targetId}
                    className="rounded-full bg-muted px-2 py-1"
                  >
                    {targetId}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanionRecapReview({
  model,
}: {
  model: CompanionWorkspaceModel;
}) {
  if (model.kind !== "recap" || model.recapLinks.length === 0) return null;

  return (
    <section className="border-b border-border/60 bg-background/72">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Recap review</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Coverage links make implemented, verified, deferred, and missing
            recap claims auditable.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {model.recapLinks.map((link) => (
            <article
              key={link.recapBlockId}
              className="rounded-3xl border border-border/60 bg-background/92 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-border/60 px-2 py-1 font-medium text-foreground">
                  {link.status}
                </span>
                <span className="text-muted-foreground">{link.recapBlockId}</span>
              </div>
              {link.note ? (
                <p className="mt-3 text-sm text-foreground">{link.note}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {link.planTargetIds.map((targetId) => (
                  <span
                    key={targetId}
                    className="rounded-full bg-muted px-2 py-1"
                  >
                    {targetId}
                  </span>
                ))}
                {link.feedbackIds.map((feedbackId) => (
                  <span
                    key={feedbackId}
                    className="rounded-full bg-muted px-2 py-1"
                  >
                    {feedbackId}
                  </span>
                ))}
                {link.evidenceIds.map((evidenceId) => (
                  <span
                    key={evidenceId}
                    className="rounded-full bg-muted px-2 py-1"
                  >
                    {evidenceId}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanionReviewPack({
  model,
}: {
  model: CompanionWorkspaceModel;
}) {
  if (model.reviewPackItems.length === 0) return null;

  return (
    <section className="border-b border-border/60 bg-background/72">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Review pack
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Domain review signals reuse the shared companion evidence and risk
            model.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {model.reviewPackItems.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-border/60 bg-background/92 p-4 shadow-sm backdrop-blur"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {item.status}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompanionImportedResults({
  model,
}: {
  model: CompanionWorkspaceModel;
}) {
  if (model.importedResults.length === 0) return null;

  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Imported results
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            External-agent result packets stay visible in the same review
            workspace as their proof and lifecycle state.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {model.importedResults.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-border/60 bg-background/92 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-border/60 px-2 py-1 font-medium text-foreground">
                  {item.status}
                </span>
                <span className="text-muted-foreground">{item.id}</span>
                {item.changedBy ? (
                  <span className="text-muted-foreground">
                    by {item.changedBy}
                  </span>
                ) : null}
              </div>
              {item.resolutionSummary ? (
                <p className="mt-3 text-sm text-foreground">
                  {item.resolutionSummary}
                </p>
              ) : null}
              {item.commitOrDiffRef ? (
                <p className="mt-3 break-words rounded-2xl bg-muted/60 px-3 py-2 font-mono text-xs text-foreground">
                  {item.commitOrDiffRef}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {item.changedFiles.map((file) => (
                  <span key={file} className="rounded-full bg-muted px-2 py-1">
                    {file}
                  </span>
                ))}
                {item.evidenceRefs.map((evidenceId) => (
                  <span
                    key={evidenceId}
                    className="rounded-full bg-muted px-2 py-1"
                  >
                    {evidenceId}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CompanionWorkspaceShell({
  model,
  children,
}: PropsWithChildren<{
  model: CompanionWorkspaceModel;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0%,_transparent_55%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.2)_100%)]">
      <header className="border-b border-border/60 bg-background/86 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                {model.kind === "recap" ? "Recap workspace" : "Plan workspace"}
              </div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {model.title}
              </h1>
              <p className="mt-2 max-w-3xl break-words text-sm text-muted-foreground">
                {model.subtitle}
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {model.cards.map((card) => (
              <CompanionWorkspaceCardView key={card.id} card={card} />
            ))}
          </div>
        </div>
      </header>
      <CompanionReviewPack model={model} />
      <CompanionImportedResults model={model} />
      <CompanionEvidencePacketList model={model} />
      <CompanionRecapReview model={model} />
      <div className="mx-auto flex w-full max-w-[1680px] min-h-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-h-0 flex-1 overflow-hidden rounded-[28px] border border-border/60 bg-background shadow-[0_28px_90px_-48px_rgba(15,23,42,0.4)]">
          {children}
        </div>
      </div>
    </div>
  );
}
