import updateLocalPlanFeedback from "./update-local-plan-feedback.js";

export default {
  ...updateLocalPlanFeedback,
  description:
    "Append local visual companion feedback sidecars for a local MDX folder.",
  publicAgent: {
    ...updateLocalPlanFeedback.publicAgent,
    title: "Update Companion Feedback",
    description:
      "Append local-only human feedback to a visual companion MDX plan folder.",
  },
};
