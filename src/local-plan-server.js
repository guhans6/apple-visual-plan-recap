import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  appendFeedbackEvent,
  readFeedback,
  reopenFeedback,
  resolveFeedback,
} from "./local-feedback.js";

export function createLocalPlanServer({ planDir, planSlug }) {
  return createHttpServer(async (request, response) => {
    try {
      const body = ["POST", "PUT", "PATCH"].includes(request.method)
        ? await readJsonBody(request)
        : {};
      const result = await handleLocalPlanRequest({
        planDir,
        planSlug,
        method: request.method,
        url: request.url,
        body,
      });
      send(response, result.status, result.body, result.contentType);
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
  });
}

export async function handleLocalPlanRequest({ planDir, planSlug, method, url, body = {} }) {
  if (method === "GET" && url === "/") {
    return {
      status: 200,
      body: await renderPlanPage({ planDir, planSlug }),
      contentType: "text/html; charset=utf-8",
    };
  }

  if (method === "GET" && url === "/api/feedback") {
    return {
      status: 200,
      body: JSON.stringify(
        await readFeedback({ planDir, includeConsumed: true, includeHumanReview: true }),
        null,
        2,
      ),
      contentType: "application/json; charset=utf-8",
    };
  }

  if (method === "POST" && url === "/api/comments") {
    const createdAt = body.createdAt ?? new Date().toISOString();
    const id = body.id ?? `fb-${Date.now()}`;
    const item = await appendFeedbackEvent({
      planDir,
      event: {
        type: "created",
        id,
        planSlug,
        targetBlockId: body.targetBlockId,
        targetKind: "block",
        anchorKind: "block",
        message: body.message,
        resolutionTarget: body.resolutionTarget ?? "agent",
        status: "open",
        creator: body.creator ?? "human",
        createdAt,
      },
    });

    return {
      status: 201,
      body: JSON.stringify(item, null, 2),
      contentType: "application/json; charset=utf-8",
    };
  }

  const resolveMatch = url?.match(/^\/api\/comments\/([^/]+)\/resolve$/);
  if (method === "POST" && resolveMatch) {
    const item = await resolveFeedback({
      planDir,
      feedbackId: resolveMatch[1],
      actor: body.actor ?? "human",
      resolvedAt: body.resolvedAt ?? new Date().toISOString(),
    });
    return {
      status: 200,
      body: JSON.stringify(item, null, 2),
      contentType: "application/json; charset=utf-8",
    };
  }

  const reopenMatch = url?.match(/^\/api\/comments\/([^/]+)\/reopen$/);
  if (method === "POST" && reopenMatch) {
    const item = await reopenFeedback({
      planDir,
      feedbackId: reopenMatch[1],
      actor: body.actor ?? "human",
      reopenedAt: body.reopenedAt ?? new Date().toISOString(),
    });
    return {
      status: 200,
      body: JSON.stringify(item, null, 2),
      contentType: "application/json; charset=utf-8",
    };
  }

  return {
    status: 404,
    body: JSON.stringify({ error: "Not found" }, null, 2),
    contentType: "application/json; charset=utf-8",
  };
}

export async function renderPlanPage({ planDir, planSlug }) {
  const mdx = await readFile(path.join(planDir, "plan.mdx"), "utf8");
  const feedback = await readFeedback({
    planDir,
    includeConsumed: true,
    includeHumanReview: true,
  });
  const blocks = extractBlocks(mdx);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(planSlug)} visual plan</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f6f7f9; color: #15171a; }
    main { max-width: 1040px; margin: 0 auto; padding: 32px 20px; }
    h1 { font-size: 28px; margin: 0 0 20px; }
    .block { background: white; border: 1px solid #d9dde3; border-radius: 8px; padding: 16px; margin: 12px 0; }
    .block:target { outline: 3px solid #0a84ff; }
    .block-header { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 8px; }
    .block-id { color: #5d6673; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
    textarea { width: 100%; min-height: 72px; resize: vertical; }
    button, select { min-height: 32px; }
    .comments { margin-top: 12px; border-top: 1px solid #eceff3; padding-top: 8px; }
    .comment { font-size: 14px; padding: 8px 0; }
    .status { color: #5d6673; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(planSlug)} visual plan</h1>
    ${blocks.map((block) => renderBlock(block, feedback.groups[block.id] ?? [])).join("\n")}
  </main>
  <script>
    document.querySelectorAll("[data-comment-form]").forEach((form) => {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        await fetch("/api/comments", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            targetBlockId: form.dataset.blockId,
            message: data.get("message"),
            resolutionTarget: data.get("resolutionTarget")
          })
        });
        location.reload();
      });
    });
  </script>
</body>
</html>`;
}

function extractBlocks(mdx) {
  return [...mdx.matchAll(/<([A-Z][A-Za-z0-9]*)\b([^>]*)>([\s\S]*?)<\/\1>|<([A-Z][A-Za-z0-9]*)\b([^>]*)\/>/g)]
    .map((match) => {
      const tag = match[1] ?? match[4];
      const attrs = match[2] ?? match[5];
      const id = attrs.match(/\bid="([^"]+)"/)?.[1];
      if (!id) return null;
      return {
        id,
        tag,
        body: (match[3] ?? attrs).trim(),
      };
    })
    .filter(Boolean);
}

function renderBlock(block, comments) {
  return `<section class="block" id="${escapeHtml(block.id)}" data-plan-block-id="${escapeHtml(block.id)}">
  <div class="block-header">
    <strong>${escapeHtml(block.tag)}</strong>
    <a class="block-id" href="#${escapeHtml(block.id)}">${escapeHtml(block.id)}</a>
  </div>
  <pre>${escapeHtml(block.body)}</pre>
  <form data-comment-form data-block-id="${escapeHtml(block.id)}">
    <textarea name="message" aria-label="Comment for ${escapeHtml(block.id)}" required></textarea>
    <select name="resolutionTarget" aria-label="Resolution target">
      <option value="agent">Agent</option>
      <option value="human-review">Human review</option>
    </select>
    <button type="submit">Add comment</button>
  </form>
  <div class="comments">
    ${comments.map((comment) => `<div class="comment"><span class="status">${escapeHtml(comment.status)}</span> ${escapeHtml(comment.message)}</div>`).join("")}
  </div>
</section>`;
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(response, statusCode, body) {
  send(response, statusCode, JSON.stringify(body, null, 2), "application/json; charset=utf-8");
}

function send(response, statusCode, body, contentType) {
  response.writeHead(statusCode, { "content-type": contentType });
  response.end(body);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
