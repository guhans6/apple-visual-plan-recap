import { useParams } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { APP_TITLE } from "@/lib/app-config";
import { CompanionPage } from "@/pages/CompanionPage";

export function meta() {
  return [
    { title: APP_TITLE },
    {
      name: "description",
      content:
        "Review a local visual companion recap from MDX files without external Plan services.",
    },
  ];
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Spinner className="size-8 text-foreground" />
    </div>
  );
}

export default function CompanionRecapRoute() {
  const params = useParams<{ slug?: string }>();
  return <CompanionPage slug={params.slug ?? ""} kind="recap" />;
}
