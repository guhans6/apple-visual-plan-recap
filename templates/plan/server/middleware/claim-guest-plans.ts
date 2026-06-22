import { defineEventHandler } from "h3";

// Local-only runtime: there is no sign-in or guest-claim flow to reconcile.
export default defineEventHandler(() => {});
