import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { agentNativePath, appBasePath } from "@agent-native/core/client";
import { TAB_ID } from "@/lib/tab-id";
import {
  companionPathForLocalArtifact,
  routeStateForLocation,
} from "@/lib/navigation-paths";

export interface NavigationState {
  view: string;
  planId?: string;
  localPlanSlug?: string;
  localPlanPath?: string;
  _writeId?: string;
}

export function useNavigationState() {
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const lastProcessedDedupKeyRef = useRef<string | null>(null);

  // Sync current route to application state
  useEffect(() => {
    const state: NavigationState = routeStateForLocation(
      location.pathname,
      location.search,
    );

    fetch(agentNativePath("/_agent-native/application-state/navigation"), {
      method: "PUT",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Source": TAB_ID,
      },
      body: JSON.stringify(state),
    }).catch(() => {});
  }, [location.pathname, location.search]);

  // Listen for navigate commands from agent
  const { data: navCommand } = useQuery({
    queryKey: ["navigate-command"],
    queryFn: async () => {
      const res = await fetch(
        agentNativePath("/_agent-native/application-state/navigate"),
      );
      if (!res.ok) return null;
      const data = await res.json();
      if (data) {
        // Return with a timestamp to ensure uniqueness
        return { ...data, _ts: Date.now() };
      }
      return null;
    },
    refetchInterval: 2_000,
    structuralSharing: false,
  });

  useEffect(() => {
    if (!navCommand) return;
    const cmd = navCommand as NavigationState;
    const dedupKey =
      cmd._writeId ??
      JSON.stringify({
        view: cmd.view,
        planId: cmd.planId,
        localPlanSlug: cmd.localPlanSlug,
        localPlanPath: cmd.localPlanPath,
      });
    const deleteCommand = () =>
      fetch(agentNativePath("/_agent-native/application-state/navigate"), {
        method: "DELETE",
        headers: {
          "X-Agent-Native-CSRF": "1",
          "X-Request-Source": TAB_ID,
        },
      }).catch(() => {});

    if (lastProcessedDedupKeyRef.current === dedupKey) {
      deleteCommand();
      qc.setQueryData(["navigate-command"], null);
      return;
    }
    lastProcessedDedupKeyRef.current = dedupKey;

    // Delete the one-shot command AFTER reading it.
    deleteCommand();
    const path = routerPath(navigationPathForCommand(cmd));
    navigate(path);
    qc.setQueryData(["navigate-command"], null);
  }, [navCommand, navigate, qc]);
}

export function navigationPathForCommand(command: NavigationState): string {
  if (command.localPlanSlug) {
    return companionPathForLocalArtifact(
      command.localPlanSlug,
      command.localPlanPath,
    );
  }
  if (command.planId) {
    return "/";
  }
  return pathForView(command.view);
}

function pathForView(view?: string): string {
  switch (view) {
    case "plan":
    case "plans":
      return "/";
    default:
      return "/";
  }
}

function routerPath(path: string): string {
  const basePath = appBasePath();
  if (!basePath) return path;
  if (path === basePath) return "/";
  if (path.startsWith(`${basePath}/`)) {
    return path.slice(basePath.length) || "/";
  }
  return path;
}
