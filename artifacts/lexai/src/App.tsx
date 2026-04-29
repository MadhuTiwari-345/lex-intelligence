import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "@/components/layout/AppLayout";
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

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster position="top-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
