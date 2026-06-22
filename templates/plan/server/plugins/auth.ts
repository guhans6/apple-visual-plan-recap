import { markDefaultPluginProvided } from "@agent-native/core/server";

export const AUTH_PLUGIN_DISABLED = true;
export const LOCAL_MODE_ACTION_PATHS: string[] = [];
export const PUBLIC_AGENT_CHAT_PATHS: string[] = [];
export const WORKSPACE_APP_PUBLIC_PATHS: string[] = [];

/**
 * Keep the `auth` plugin stem present so framework discovery does not
 * auto-mount hosted auth defaults into the companion surface.
 */
export default function authPluginDisabled(nitroApp: unknown) {
  markDefaultPluginProvided(nitroApp, "auth");
}
