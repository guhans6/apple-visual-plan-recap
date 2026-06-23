import {
  BlockRegistry,
  registerBlocks,
  // The full block library (checklist/table/code-tabs/html/tabs/columns, the
  // eight dev-doc blocks, plus callout/decision/question-form/visual-questions/
  // diagram/wireframe) is registered in ONE shared place via
  // `registerLibraryBlocks`. Plan registers no app-only blocks of its own.
  registerLibraryBlocks,
  type LibraryBlockOverrides,
  type OpenApiSpecData,
  type BlockRenderContext,
  type NestedBlock,
} from "@agent-native/core/blocks";
import type { PlanBlock } from "@shared/plan-content";
import { PlanBlockView } from "./DocumentArea";
import { PlanMarkdownReader } from "./PlanMarkdownReader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type RichMarkdownCollabUser = {
  name: string;
  color: string;
  email?: string;
};

type PlanBlockRenderContextExtras = {
  onQuestionFormSubmit?: (summary: string) => void;
  showCodeAnnotationOverlays?: boolean;
  codeAnnotationLayout?: BlockRenderContext["codeAnnotationLayout"];
};

/**
 * Browser-side plan block registry. Registers the full library specs (with their
 * React `Read`/`Edit`) used by `PlanBlockView` to render registered blocks. The
 * same React-free `schema`/`mdx` config is registered server-side from the shared
 * core library (`shared/plan-block-registry.ts`) so rendering and source
 * round-trip never drift.
 *
 * Callout uses the shared `CalloutBlock` for read and a custom hybrid editor:
 * the body stays normal inline markdown prose, while tone/type metadata lives in
 * the block edit popover.
 */
export const planBlockRegistry = new BlockRegistry();

// All of plan's former plan-specific blocks (callout, diagram, wireframe,
// question-form, visual-questions, decision) now live in the shared core block
// library and register via `registerLibraryBlocks` below — so plan and content
// get them from one place. Plan registers no app-only blocks today.
registerBlocks(planBlockRegistry, []);

/**
 * Plan's per-block overrides for the shared standard library: the Mermaid
 * description is phrased for the plan's hand-drawn render style, and the OpenAPI
 * example seeds a richer spec (with a POST + `$ref` model). Everything else
 * (schema, MDX config, React `Read`/`Edit`, labels, placement) is the canonical
 * core value, so the library lives in exactly one place.
 */
const PLAN_LIBRARY_OVERRIDES: LibraryBlockOverrides = {
  mermaid: {
    description:
      "A Mermaid diagram for cases where textual sequence or flowchart grammar is clearer than a spatial layout; not the default for architecture maps.",
  },
  "openapi-spec": {
    empty: (): OpenApiSpecData => ({
      spec: JSON.stringify(
        {
          openapi: "3.0.0",
          info: { title: "Example API", version: "1.0.0" },
          tags: [{ name: "widgets", description: "Manage widgets" }],
          paths: {
            "/widgets": {
              get: {
                tags: ["widgets"],
                summary: "List widgets",
                responses: {
                  "200": {
                    description: "OK",
                    content: {
                      "application/json": {
                        schema: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Widget" },
                        },
                      },
                    },
                  },
                },
              },
              post: {
                tags: ["widgets"],
                summary: "Create a widget",
                requestBody: {
                  content: {
                    "application/json": {
                      schema: { $ref: "#/components/schemas/Widget" },
                    },
                  },
                },
                responses: { "201": { description: "Created" } },
              },
            },
          },
          components: {
            schemas: {
              Widget: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        null,
        2,
      ),
    }),
  },
};

// The full shared library (checklist/table/code-tabs/html/tabs/columns, the
// eight dev-doc blocks, plus callout/decision/question-form/visual-questions/
// diagram/wireframe). The same React-free schema/MDX config is registered
// server-side in `shared/plan-block-registry`.
registerLibraryBlocks(planBlockRegistry, {
  overrides: PLAN_LIBRARY_OVERRIDES,
});

/**
 * Build the {@link BlockRenderContext} that the auto-editor and block `Read`
 * components receive. Wires the markdown field to the shared plan editor/reader
 * so the body stays inline-editable and source-syncable through the same GFM
 * pipeline the `rich-text` block uses, and wires `renderBlock` to the plan's own
 * `PlanBlockView` so container blocks (e.g. tabs) recurse through the same
 * dispatcher the top-level document uses — registered children via their spec,
 * unconverted children via the legacy switch (the coexistence seam).
 */
export function createPlanBlockRenderContext(options: {
  contentUpdatedAt?: string | null;
  planId?: string | null;
  collabUser?: RichMarkdownCollabUser | null;
  /** Document-level handlers threaded to nested child blocks (e.g. in tabs). */
  onRichTextChange?: (
    blockId: string,
    markdown: string,
  ) => Promise<void> | void;
  onVisualQuestionsSubmit?: (summary: string) => void;
  renderBlocksEditor?: BlockRenderContext["renderBlocksEditor"];
  editingDisabled?: boolean;
  showCodeAnnotationOverlays?: boolean;
  codeAnnotationLayout?: BlockRenderContext["codeAnnotationLayout"];
}): BlockRenderContext {
  const ctx: BlockRenderContext & PlanBlockRenderContextExtras = {
    dialect: "gfm",
    showCodeAnnotationOverlays: options.showCodeAnnotationOverlays,
    codeAnnotationLayout: options.codeAnnotationLayout,
    onQuestionFormSubmit: options.onVisualQuestionsSubmit,
    renderMarkdown: (markdown, options) => (
      <PlanMarkdownReader markdown={markdown} className={options?.className} />
    ),
    renderMarkdownEditor: ({ value, className }) => (
      <PlanMarkdownReader markdown={value} className={className} />
    ),
    renderAiFieldAction: undefined,
    // Recursively render a nested child block through the plan dispatcher. The
    // child's `onChange` (when provided by an editable container) bubbles the
    // updated child back up — mirroring the legacy `TabsBlock` onChange path so
    // the recursive `updateBlocks`/`findBlock` in `PlanContentRenderer` keep
    // working unchanged.
    renderBlock: ({ block, onChange, compactVisuals }) => (
      <PlanBlockView
        block={block as PlanBlock}
        onChange={
          onChange
            ? (nextChild) => onChange(nextChild as NestedBlock)
            : undefined
        }
        onRichTextChange={options.onRichTextChange}
        onVisualQuestionsSubmit={options.onVisualQuestionsSubmit}
        compactVisuals={compactVisuals}
        contentUpdatedAt={options.contentUpdatedAt}
        editingDisabled={options.editingDisabled}
        planId={options.planId}
        collabUser={options.collabUser}
      />
    ),
    renderBlocksEditor: options.renderBlocksEditor,
    // `editSurface: "panel"` blocks (diagram, custom HTML, and other rendered
    // artifacts/config blocks) keep their rendered `Read` view and expose the
    // editor in this shadcn popover anchored to the corner button. Prose and
    // containers stay inline.
    renderEditSurface: ({
      title,
      trigger,
      children,
      open,
      onOpenChange,
      variant,
    }) => {
      const compactMenu = variant === "menu";

      return (
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            align="end"
            collisionPadding={16}
            sideOffset={6}
            data-plan-interactive
            className={cn(
              "relative flex max-h-[calc(100vh-32px)] overflow-y-auto",
              compactMenu
                ? "an-block-menu-popover w-64 flex-col gap-1 rounded-xl p-1"
                : "an-block-edit-popover w-[min(42rem,calc(100vw-32px))] flex-col gap-3",
            )}
          >
            {compactMenu ? (
              children
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 truncate pt-0.5 text-sm font-semibold text-foreground">
                    {title}
                  </div>
                </div>
                {children}
              </>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  };
  return ctx;
}
