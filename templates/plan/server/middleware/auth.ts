import { createError, defineEventHandler } from "h3";

export default defineEventHandler(async (event) => {
  const path = (event.node?.req?.url ?? event.path ?? "/").split("?")[0] ?? "/";
  if (
    path === "/_agent-native/sign-in" ||
    path.startsWith("/_agent-native/auth/")
  ) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  return;
});
