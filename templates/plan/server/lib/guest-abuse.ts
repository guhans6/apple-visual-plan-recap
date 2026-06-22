import type { H3Event } from "h3";

// Local-only runtime: guest-abuse checks are disabled because unauthenticated
// local plan creation resolves to the single local owner identity.
export class GuestAbuseLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GuestAbuseLimitError";
  }
}

export async function tryConsumeGuestMint(_event: H3Event): Promise<boolean> {
  return true;
}

export async function assertGuestCreateWithinLimits(
  _ownerEmail: string,
): Promise<void> {}
