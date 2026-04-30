import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "@/pages/landing";
import { SignInPage, SignUpPage } from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Matters from "@/pages/matters";
import MatterDetail from "@/pages/matter-detail";
import Contracts from "@/pages/contracts";
import ContractDetail from "@/pages/contract-detail";
import Documents from "@/pages/documents";
import DocumentDetail from "@/pages/document-detail";
import Deadlines from "@/pages/deadlines";
import Research from "@/pages/research";
import ResearchDetail from "@/pages/research-detail";
import Briefs from "@/pages/briefs";
import BriefDetail from "@/pages/brief-detail";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "hsl(22, 64%, 47%)",
    colorForeground: "hsl(18, 47%, 12%)",
    colorMutedForeground: "hsl(25, 18%, 38%)",
    colorDanger: "hsl(0, 70%, 45%)",
    colorBackground: "hsl(42, 56%, 95%)",
    colorInput: "hsl(42, 30%, 98%)",
    colorInputForeground: "hsl(18, 47%, 12%)",
    colorNeutral: "hsl(25, 22%, 80%)",
    fontFamily: '"Mulish", system-ui, sans-serif',
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-card border border-border rounded-2xl w-[440px] max-w-full overflow-hidden shadow-sm",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-2xl font-bold text-foreground",
    headerSubtitle: "text-sm text-muted-foreground",
    socialButtonsBlockButton:
      "border border-border bg-card hover:bg-accent text-foreground",
    socialButtonsBlockButtonText: "text-sm font-medium text-foreground",
    formFieldLabel: "text-sm font-medium text-foreground",
    formFieldInput:
      "bg-input border border-border text-foreground placeholder:text-muted-foreground",
    formButtonPrimary:
      "bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    footerActionText: "text-sm text-muted-foreground",
    dividerText: "text-xs uppercase tracking-wider text-muted-foreground",
    dividerLine: "bg-border",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldSuccessText: "text-primary",
    alertText: "text-sm",
    alert: "border border-border bg-card",
    otpCodeFieldInput: "bg-input border border-border text-foreground",
    formFieldRow: "",
    main: "",
    logoBox: "mx-auto mb-2",
    logoImage: "h-10 w-10",
  },
};

function AppShell() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/app" component={Dashboard} />
        <Route path="/matters" component={Matters} />
        <Route path="/matters/:id" component={MatterDetail} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/contracts/:id" component={ContractDetail} />
        <Route path="/documents" component={Documents} />
        <Route path="/documents/:id" component={DocumentDetail} />
        <Route path="/deadlines" component={Deadlines} />
        <Route path="/research" component={Research} />
        <Route path="/research/:id" component={ResearchDetail} />
        <Route path="/briefs" component={Briefs} />
        <Route path="/briefs/:id" component={BriefDetail} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function ProtectedApp() {
  return (
    <>
      <Show when="signed-in">
        <AppShell />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function HomeRoute() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/app" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl={`${basePath}/app`}
      signUpFallbackRedirectUrl={`${basePath}/app`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your LexAI workspace",
          },
        },
        signUp: {
          start: {
            title: "Create your LexAI account",
            subtitle: "Drafting, review and research — in one place",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={ProtectedApp} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
