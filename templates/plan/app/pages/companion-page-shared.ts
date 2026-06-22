export function localPlanLoadErrorCopy(input: {
  slug: string;
  error?: unknown;
  companionKind?: "plan" | "recap";
}) {
  const message =
    input.error instanceof Error && input.error.message
      ? input.error.message.replace(/^Action [\w-]+ failed:\s*/, "")
      : `The local plan folder "${input.slug}" could not be read.`;
  if (input.companionKind) {
    const missing =
      !(input.error instanceof Error) ||
      /not found|missing|could not be read|internal server error|enoent|no such file or directory/i.test(
        message,
      );
    return {
      title: input.companionKind === "recap" ? "Recap not found" : "Plan not found",
      message: missing
        ? `This ${input.companionKind} could not be found in the current companion workspace.`
        : message,
    };
  }
  return {
    title: "Local plan not found",
    message,
  };
}
