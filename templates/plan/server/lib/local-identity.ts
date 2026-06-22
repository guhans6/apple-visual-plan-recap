/**
 * Local single-user identity resolution for the no-login companion runtime.
 *
 * `/visual-plan` is local-first: by default a person creates, edits, and views
 * plans with NO login. Plans persist to the local repo as MDX plus local SQL.
 *
 * To make that work, plan actions resolve one stable local owner identity for
 * local plan work, even when the browser happens to carry some unrelated
 * session state.
 *
 * This template is companion-first now. The only runtime gate is the hard
 * production refusal.
 *
 * `PLAN_LOCAL_OWNER_EMAIL` may override the synthetic owner in local runtime
 * only.
 */

/**
 * Stable owner email for the local single-user identity. Kept distinct from the
 * core dev sentinel `local@localhost` (which the resolvers intentionally reject).
 */
export const LOCAL_PLAN_OWNER_EMAIL = "local@agent-native.local";

export function getLocalPlanOwnerEmail(): string {
  return process.env.PLAN_LOCAL_OWNER_EMAIL?.trim() || LOCAL_PLAN_OWNER_EMAIL;
}

export const GUEST_AUTHOR_DOMAIN = "agent-native.guest";

export function isGuestAuthorIdentity(
  email: string | null | undefined,
): boolean {
  return (
    typeof email === "string" &&
    /^guest-[0-9a-f-]+@agent-native\.guest$/i.test(email)
  );
}

export function isAnonymousPublicViewer(
  email: string | null | undefined,
): boolean {
  return (
    typeof email === "string" &&
    /^public-[0-9a-f-]+@agent-native\.local$/i.test(email)
  );
}

/**
 * True when this process is allowed to assume the local single-user identity.
 *
 * CRITICAL: this must never return true on a production deploy. The
 * production short-circuit is first and unconditional.
 */
export function isLocalPlanRuntime(): boolean {
  // Hard refusal: never assume a local identity in production, regardless of
  // any other flag. Mirrors the runtime assertions in core's dev fallbacks.
  // Case-insensitive + whitespace-tolerant: a mis-cased "Production" or a padded
  // value must still trip the hard refusal, never silently enable companion runtime.
  const nodeEnv = (process.env.NODE_ENV ?? "").trim().toLowerCase();
  if (nodeEnv === "production" || nodeEnv === "prod") return false;

  // Default dev/test behavior: the template runs as the local companion.
  return true;
}

function shouldUseLocalPlanOwner(
  authenticatedEmail: string | undefined,
): boolean {
  if (!isLocalPlanRuntime()) return false;
  if (isAnonymousPublicViewer(authenticatedEmail)) return false;
  return true;
}

export type PlanAccessContext = {
  userEmail?: string;
  orgId?: string;
};

/**
 * Current request context adjusted for local single-user plan access.
 *
 * In companion runtime, a coding agent may create a plan through the CLI/no-login
 * path while Codex Desktop has a signed-in browser session. Both are one local
 * workspace, so reads/lists/edits should resolve against the same synthetic
 * owner instead of stranding private plans behind whichever auth surface created
 * them. Non-local contexts are returned unchanged.
 */
export function resolvePlanAccessContext(
  ctx: PlanAccessContext,
): PlanAccessContext {
  if (shouldUseLocalPlanOwner(ctx.userEmail)) {
    return { userEmail: getLocalPlanOwnerEmail() };
  }
  return ctx;
}

/**
 * Resolve the org scope that should be persisted beside a newly written plan.
 * This mirrors `resolvePlanAccessContext()` so local single-user plans do not
 * get tagged with an authenticated dev-session org that the synthetic local
 * owner cannot later access.
 */
export function resolvePlanOrgIdForWrite(
  authenticatedEmail: string | undefined,
  requestOrgId: string | undefined,
): string | undefined {
  return resolvePlanAccessContext({
    userEmail: authenticatedEmail,
    orgId: requestOrgId,
  }).orgId;
}

/**
 * Resolve the owner email for a plan write/read.
 *
 * Priority:
 *   1. The local single-user identity in companion runtime.
 *   2. The authenticated request user in non-local auth modes.
 *
 * Returns `undefined` when no identity is available,
 * so callers can reject exactly as before.
 */
export function resolvePlanOwnerEmail(
  authenticatedEmail: string | undefined,
): string | undefined {
  if (shouldUseLocalPlanOwner(authenticatedEmail)) {
    return getLocalPlanOwnerEmail();
  }
  if (authenticatedEmail) return authenticatedEmail;
  return undefined;
}

/**
 * Resolve the owner email for a plan WRITE (create / import / patch / visualize).
 *
 * Resolution priority:
 *   1. The local single-user identity in companion runtime.
 *   2. The authenticated request user in non-local auth modes.
 *
 * Returns `undefined` when no identity is available,
 * unidentified), so callers reject exactly as before.
 */
export function resolvePlanOwnerEmailForWrite(
  authenticatedEmail: string | undefined,
): string | undefined {
  if (shouldUseLocalPlanOwner(authenticatedEmail)) {
    return getLocalPlanOwnerEmail();
  }
  if (
    authenticatedEmail &&
    !isGuestAuthorIdentity(authenticatedEmail) &&
    !isAnonymousPublicViewer(authenticatedEmail)
  ) {
    return authenticatedEmail;
  }
  return undefined;
}

/**
 * Resolve the owner email for a plan write and throw a friendly error when no
 * identity is available. Use at the top of create-style actions.
 *
 * Accepts a real account or the local single-user identity (companion runtime).
 * On a non-local deployment with no authenticated user it throws, preserving the
 * "requires an authenticated user" contract for unidentified requests.
 */
export function requirePlanOwnerEmailForWrite(
  authenticatedEmail: string | undefined,
  action: string,
): string {
  const owner = resolvePlanOwnerEmailForWrite(authenticatedEmail);
  if (!owner) {
    throw new Error(`${action} requires an authenticated user.`);
  }
  return owner;
}

/**
 * Legacy require helper retained for backward compatibility. Behaves exactly as
 * before (authenticated user OR local single-user identity; throws otherwise).
 */
export function requirePlanOwnerEmail(
  authenticatedEmail: string | undefined,
  action: string,
): string {
  const owner = resolvePlanOwnerEmail(authenticatedEmail);
  if (!owner) {
    throw new Error(`${action} requires an authenticated user.`);
  }
  return owner;
}
