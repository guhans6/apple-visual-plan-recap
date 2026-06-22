import type { H3Event } from "h3";
import { getLocalPlanOwnerEmail, isLocalPlanRuntime } from "./local-identity.js";

/**
 * Minimal anonymous-owner resolver for the local-only plan app.
 */
export async function resolvePlanAnonymousOwner(
  _event: H3Event,
): Promise<string | null> {
  return isLocalPlanRuntime() ? getLocalPlanOwnerEmail() : null;
}
