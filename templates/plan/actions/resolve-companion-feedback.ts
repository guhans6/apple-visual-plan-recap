import resolveLocalPlanFeedback from "./resolve-local-plan-feedback.js";

export default {
  ...resolveLocalPlanFeedback,
  requiresAuth: false,
  description:
    "Resolve or reopen local visual companion feedback by appending a sidecar event.",
  publicAgent: {
    ...resolveLocalPlanFeedback.publicAgent,
    title: "Resolve Companion Feedback",
    description:
      "Resolve or reopen local visual companion feedback while preserving review history.",
  },
};
