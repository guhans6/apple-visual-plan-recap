import consumeLocalPlanFeedback from "./consume-local-plan-feedback.js";

export default {
  ...consumeLocalPlanFeedback,
  description:
    "Mark local visual companion feedback comments as consumed after acting on them.",
  publicAgent: {
    ...consumeLocalPlanFeedback.publicAgent,
    title: "Consume Companion Feedback",
    description:
      "Mark companion feedback consumed so it no longer appears as pending agent work.",
  },
};
