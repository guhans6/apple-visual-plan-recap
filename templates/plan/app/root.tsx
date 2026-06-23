import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { useState } from "react";
import {
  AppProviders,
  appPath,
  createAgentNativeQueryClient,
  getThemeInitScript,
} from "@/lib/local-shell";
import { Toaster } from "@/components/ui/sonner";
import { Layout as AppLayout } from "@/components/layout/Layout";
import { APP_TITLE } from "@/lib/app-config";
import type { LinksFunction } from "react-router";
import stylesheet from "./global.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

const THEME_INIT_SCRIPT = getThemeInitScript();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <link rel="manifest" href={appPath("/manifest.json")} />
        <meta name="theme-color" content="#71717A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content={APP_TITLE} />
        <link rel="icon" type="image/svg+xml" href={appPath("/favicon.svg")} />
        <link rel="apple-touch-icon" href={appPath("/icon-180.svg")} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppContent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function Root() {
  const [queryClient] = useState(() => createAgentNativeQueryClient());
  return (
    // Pass the plan-specific styled Toaster via `toaster` so only one sonner
    // instance renders (avoids the duplicate that would appear if AppProviders'
    // built-in Toaster AND a children-rendered Toaster both mounted).
    <AppProviders
      queryClient={queryClient}
      toaster={<Toaster richColors position="bottom-left" />}
    >
      <AppContent />
    </AppProviders>
  );
}

export { ErrorBoundary } from "@/lib/local-shell";
