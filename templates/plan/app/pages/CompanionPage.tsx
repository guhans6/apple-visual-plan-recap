import { useLocation } from "react-router";
import { CompanionArtifactPage } from "./CompanionArtifactPage";

export function CompanionPage({
  slug,
  kind,
}: {
  slug: string;
  kind: "plan" | "recap";
}) {
  const location = useLocation();
  const repoPath = new URLSearchParams(location.search).get("path");
  return <CompanionArtifactPage slug={slug} kind={kind} repoPath={repoPath} />;
}
