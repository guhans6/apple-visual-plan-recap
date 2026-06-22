import { useEffect, useRef, useState } from "react";
import {
  IconArrowLeft,
  IconHistory,
  IconLoader2,
  IconRestore,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanContentRenderer } from "@/components/plan/PlanContentRenderer";
import {
  usePlanVersion,
  usePlanVersions,
  useRestorePlanVersion,
} from "@/hooks/use-plans";
import type { PlanVersionDetail, PlanVersionSummary } from "@shared/types";
import {
  diffPlanVersions,
  formatVersionDiffSummary,
} from "@shared/plan-version-diff";

function shortDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function planVersionSurfaceLabel(version: PlanVersionSummary) {
  if (version.hasPrototype) return "Prototype";
  if (version.hasCanvas) return "Canvas";
  if (version.blockCount > 0) return `${version.blockCount} blocks`;
  return `${version.sectionCount} sections`;
}

export function HostedPlanHistorySheet({
  planId,
  open,
  onOpenChange,
  canRestore,
}: {
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canRestore: boolean;
}) {
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  const versionsQuery = usePlanVersions(planId, open);
  const versionQuery = usePlanVersion(open ? planId : null, selectedVersionId);
  const restoreVersion = useRestorePlanVersion();
  const versions = versionsQuery.data?.versions ?? [];
  const selectedVersion = versionQuery.data;
  const versionDetailCache = useRef<Map<string, PlanVersionDetail>>(new Map());

  useEffect(() => {
    if (!open) setSelectedVersionId(null);
  }, [open]);

  useEffect(() => {
    setSelectedVersionId(null);
    versionDetailCache.current = new Map();
  }, [planId]);

  useEffect(() => {
    if (versionQuery.data) {
      versionDetailCache.current.set(versionQuery.data.id, versionQuery.data);
    }
  }, [versionQuery.data]);

  const close = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedVersionId(null);
    onOpenChange(nextOpen);
  };

  const restoreSelectedVersion = async () => {
    if (!selectedVersionId) return;
    try {
      await restoreVersion.mutateAsync({
        planId,
        versionId: selectedVersionId,
      });
      toast.success("Plan version restored.");
      close(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message.replace(/^Action [\w-]+ failed:\s*/, "")
          : "Failed to restore plan version.",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="right" className="w-[92vw] max-w-[720px] p-0">
        <SheetHeader className="px-4 pt-4 pb-0">
          <SheetTitle className="flex min-w-0 items-center gap-2 text-sm font-medium">
            {selectedVersionId ? (
              <button
                type="button"
                onClick={() => setSelectedVersionId(null)}
                className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <IconArrowLeft className="size-4" />
                <span>Back to history</span>
              </button>
            ) : (
              <>
                <IconHistory className="size-4 text-primary" />
                <span>Plan history</span>
              </>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Browse saved plan versions and restore a previous snapshot.
          </SheetDescription>
        </SheetHeader>
        <Separator className="mt-3" />

        {selectedVersionId ? (
          <div className="flex h-[calc(100%-60px)] min-h-0 flex-col">
            <div className="border-b border-border px-4 py-3">
              {versionQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ) : (
                <>
                  <p className="truncate text-sm font-medium">
                    {selectedVersion?.title || "Untitled plan"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {selectedVersion
                      ? `${shortDate(selectedVersion.createdAt)} · ${planVersionSurfaceLabel(selectedVersion)}`
                      : "Snapshot unavailable"}
                  </p>
                </>
              )}
            </div>
            <ScrollArea className="min-h-0 flex-1 bg-plan-document">
              {versionQuery.isLoading ? (
                <div className="space-y-3 p-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                </div>
              ) : selectedVersion?.plan.content ? (
                <PlanContentRenderer
                  content={selectedVersion.plan.content}
                  fallbackTitle={selectedVersion.plan.title}
                  fallbackBrief={selectedVersion.plan.brief}
                  contentUpdatedAt={selectedVersion.plan.updatedAt}
                  editingDisabled
                  isRecap={selectedVersion.plan.kind === "recap"}
                  planId={null}
                />
              ) : selectedVersion?.html ? (
                <iframe
                  title="Plan version preview"
                  srcDoc={selectedVersion.html}
                  sandbox="allow-forms allow-scripts"
                  className="h-[calc(100vh-142px)] w-full border-0 bg-background"
                />
              ) : (
                <div className="px-6 py-14 text-center text-sm text-muted-foreground">
                  This snapshot has no previewable content.
                </div>
              )}
            </ScrollArea>
            {canRestore ? (
              <div className="border-t border-border p-3">
                <Button
                  type="button"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => void restoreSelectedVersion()}
                  disabled={restoreVersion.isPending || versionQuery.isLoading}
                >
                  {restoreVersion.isPending ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconRestore className="size-4" />
                  )}
                  Restore this version
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Your current version is saved to history first.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <ScrollArea className="h-[calc(100%-60px)]">
            {versionsQuery.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : versions.length ? (
              <div className="p-2">
                {versions.map((version, index) => {
                  const cache = versionDetailCache.current;
                  const thisDetail = cache.get(version.id);
                  const olderVersion = versions[index + 1];
                  const olderDetail = olderVersion
                    ? cache.get(olderVersion.id)
                    : undefined;
                  const isOldest = index === versions.length - 1;
                  const diffSummary =
                    thisDetail && (isOldest || olderDetail)
                      ? formatVersionDiffSummary(
                          diffPlanVersions(
                            {
                              content: thisDetail.plan.content,
                              sections: thisDetail.sections,
                              html: thisDetail.html,
                            },
                            isOldest
                              ? null
                              : {
                                  content: olderDetail!.plan.content,
                                  sections: olderDetail!.sections,
                                  html: olderDetail!.html,
                                },
                          ),
                        )
                      : null;

                  return (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => setSelectedVersionId(version.id)}
                      className="w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/45">
                          <IconHistory className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-medium">
                              {version.title || "Untitled plan"}
                            </p>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {planVersionSurfaceLabel(version)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {shortDate(version.createdAt)}
                            {version.label ? ` · ${version.label}` : ""}
                          </p>
                          {diffSummary ? (
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
                              {diffSummary}
                            </p>
                          ) : version.preview ? (
                            <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground/80">
                              {version.preview}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-14 text-center">
                <IconHistory className="mx-auto mb-3 size-6 text-muted-foreground/60" />
                <p className="text-sm font-medium">No saved versions yet</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Versions are saved automatically before future plan edits.
                </p>
              </div>
            )}
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
