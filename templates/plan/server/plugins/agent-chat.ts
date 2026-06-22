import { createAgentChatPlugin } from "@agent-native/core/server";

export const AGENT_CHAT_PLUGIN_DISABLED = false;
export const LOCAL_COMPANION_AGENT_CHAT_PATH =
  "/_agent-native/local-companion-agent-chat";

/**
 * Keep the backend bootstrap that mounts action routes and shared agent-native
 * server surfaces, but move the interactive agent-chat route off the default
 * path so the local visual companion does not expose the bundled chat UI.
 */
export default createAgentChatPlugin({
  path: LOCAL_COMPANION_AGENT_CHAT_PATH,
});
