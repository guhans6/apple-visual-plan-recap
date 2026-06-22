import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import {
  IconClipboardCheck,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  DevDatabaseLink,
  appPath,
} from "@agent-native/core/client";
import { APP_TITLE } from "@/lib/app-config";
import { useCompanionDashboard } from "@/hooks/use-companion-plan";
import { isCompanionDetailPath } from "@/lib/navigation-paths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [{ icon: IconClipboardCheck, label: "Plan", href: "/" }];

interface SidebarProps {
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

function formatPlanAge(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "";
  const diffMs = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function PlansSidebarSection({ collapsed }: { collapsed: boolean }) {
  const location = useLocation();
  const dashboardQuery = useCompanionDashboard(false);
  const selectedPath = `${location.pathname}${location.search}`;
  const allArtifacts = useMemo(
    () => [
      ...(dashboardQuery.data?.currentProject.plans ?? []),
      ...(dashboardQuery.data?.currentProject.recaps ?? []),
    ],
    [dashboardQuery.data?.currentProject.plans, dashboardQuery.data?.currentProject.recaps],
  );
  const hasMore = useMemo(
    () => allArtifacts.length > 10,
    [allArtifacts],
  );
  const artifacts = useMemo(() => allArtifacts.slice(0, 10), [allArtifacts]);

  if (collapsed) return null;

  return (
    <div className="mt-2 border-l border-sidebar-border/70 pl-3">
      <div className="mb-1 flex h-7 items-center gap-2 pr-1">
        <div className="min-w-0 flex-1 text-xs font-medium text-sidebar-foreground/70">
          Artifacts
        </div>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="grid gap-1">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-8 rounded-md bg-sidebar-accent" />
          ))}
        </div>
      ) : artifacts.length === 0 ? (
        <p className="px-2 py-1.5 text-xs leading-5 text-sidebar-foreground/55">
          No companion artifacts yet.
        </p>
      ) : (
        <div className="grid gap-0.5">
          {artifacts.map((artifact) => {
            const isActive = artifact.routePath === selectedPath;
            return (
              <Link
                key={artifact.routePath}
                to={artifact.routePath}
                className={cn(
                  "group flex h-8 min-w-0 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground",
                )}
              >
                <span className="min-w-0 flex-1 truncate">{artifact.title}</span>
                {artifact.kind === "recap" && (
                  <Badge
                    variant="outline"
                    className="h-4 shrink-0 rounded px-1 text-[9px]"
                  >
                    Recap
                  </Badge>
                )}
                <span className="shrink-0 text-[11px] text-sidebar-foreground/45">
                  {formatPlanAge(artifact.updatedAt)}
                </span>
              </Link>
            );
          })}
          {hasMore && (
            <Link
              to="/"
              className="rounded-md px-2 py-1.5 text-left text-xs leading-5 text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent/65 hover:text-sidebar-accent-foreground"
            >
              View all artifacts…
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  collapsed = false,
  collapsible = true,
  onCollapsedChange,
}: SidebarProps) {
  const location = useLocation();
  const ToggleIcon = collapsed
    ? IconLayoutSidebarLeftExpand
    : IconLayoutSidebarLeftCollapse;

  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "flex h-full min-w-0 shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-150",
        collapsed ? "w-14" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-0" : "gap-2 px-3",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-2",
            collapsed ? "justify-center" : "flex-1",
          )}
        >
          <img
            src={appPath("/agent-native-icon-light.svg")}
            alt=""
            aria-hidden="true"
            className="block h-4 w-auto max-w-7 shrink-0 dark:hidden"
          />
          <img
            src={appPath("/agent-native-icon-dark.svg")}
            alt=""
            aria-hidden="true"
            className="hidden h-4 w-auto max-w-7 shrink-0 dark:block"
          />
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">
              {APP_TITLE}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? location.pathname === "/" || isCompanionDetailPath(location.pathname)
              : location.pathname.startsWith(item.href);
          return (
            <div key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                  collapsed && "justify-center gap-0 px-0",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {collapsed ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  item.label
                )}
              </Link>
              {item.href === "/" && isActive ? (
                <PlansSidebarSection collapsed={collapsed} />
              ) : null}
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <>
          <div className="space-y-2 border-t border-border px-3 py-2">
            <DevDatabaseLink />
          </div>
        </>
      )}

      {collapsible && (
        <div
          className={cn(
            "border-t border-border px-2 py-2",
            collapsed ? "flex justify-center" : "flex justify-end",
          )}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 shrink-0 text-muted-foreground"
            onClick={() => onCollapsedChange?.(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ToggleIcon className="size-4" />
          </Button>
        </div>
      )}
    </aside>
  );
}
