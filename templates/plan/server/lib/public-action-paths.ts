// Paths accessible without a session in the local app.
export const PUBLIC_PLAN_ACTION_PATHS = [
  // Read / review
  "/_agent-native/actions/list-companion-dashboard",
  "/_agent-native/actions/get-companion-plan",
  "/_agent-native/actions/get-companion-feedback",
  "/_agent-native/actions/get-local-plan-folder",
  "/_agent-native/actions/get-plan-blocks",
  // Write
  "/_agent-native/actions/update-local-plan-folder",
  "/_agent-native/actions/promote-local-plan-folder",
  "/_agent-native/actions/update-local-plan-feedback",
  "/_agent-native/actions/resolve-local-plan-feedback",
  "/_agent-native/actions/consume-local-plan-feedback",
  "/_agent-native/actions/patch-visual-plan-source",
] as const;
