/**
 * Curated connector catalog for local-first Plan deployments.
 *
 * External coding agents (Claude Code, Codex, Cursor, etc.) connecting via MCP
 * see only these tools plus the builtin cross-app tools (list_apps, open_app,
 * ask_app, create_embed_session). Tools outside this list are not callable.
 *
 * Callers who need every action registered by this Plan MCP mount can opt up
 * with `agent-native connect --full-catalog`. That bypasses this curated
 * catalog tier, but it still does not add generic framework/dev/local tools
 * that this Plan MCP server intentionally never mounts.
 *
 * EXCLUDED intentionally:
 *   - seed-kitchen-sink, seed-vertical-tabs  (destructive demo scripts)
 *   - get-local-plan-folder                  (filesystem path, not useful remotely)
 *   - context-manifest-get/pin/evict/restore/report  (context-xray internals)
 *   - visualize-plan                         (internal alias, superseded)
 */
export const PLAN_CONNECTOR_CATALOG: string[] = [
  // Companion creation
  "create-visual-plan",
  "create-visual-recap",
  // Companion review
  "list-companion-dashboard",
  "get-companion-plan",
  "get-companion-feedback",
  "get-plan-blocks",
  "update-local-plan-folder",
  "promote-local-plan-folder",
  "update-local-plan-feedback",
  "resolve-local-plan-feedback",
  "consume-local-plan-feedback",
  // Source / export
  "export-companion-selection",
  "import-companion-result",
  "patch-visual-plan-source",
  // Record recap
  "record-recap-usage",
  // Navigation & screen
  "navigate",
  "view-screen",
  // Automations (users configure plan event notifications from external agents)
  "manage-automations",
  // Tool discovery
  "tool-search",
];
