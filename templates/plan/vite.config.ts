import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "@agent-native/core/vite";

const GENERATED_RUNTIME_WATCH_IGNORES = [
  "**/node_modules/**",
  "**/.react-router/**",
  "**/.deploy-tmp/**",
  "**/data/**",
  "**/test-results/**",
];

export default defineConfig({
  plugins: [generatedRuntimeWatchIgnorePlugin(), reactRouter()],
  // Browser-only renderers run in useEffect — keep them out of the CF Pages
  // Functions bundle (25 MiB limit) and away from SSR DOM/canvas shims.
  ssrStubs: [
    "shiki",
    "mermaid",
    "@excalidraw/excalidraw",
    "@excalidraw/mermaid-to-excalidraw",
  ],
});

function generatedRuntimeWatchIgnorePlugin() {
  return {
    name: "visual-companion-generated-runtime-watch-ignore",
    config() {
      return {
        server: {
          watch: {
            ignored: GENERATED_RUNTIME_WATCH_IGNORES,
          },
        },
      };
    },
  };
}
