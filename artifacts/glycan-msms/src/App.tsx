import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppFooter } from "@/components/AppFooter";
import Welcome from "@/pages/Welcome";
import Home from "@/pages/Home";
import Challenges from "@/pages/Challenges";
import NomenclatureGuide from "@/pages/NomenclatureGuide";
import MonosaccharidesModifications from "@/pages/MonosaccharidesModifications";
import GettingStarted from "@/pages/GettingStarted";
import ReferencesPage from "@/pages/ReferencesPage";
import ResourcesPage from "@/pages/ResourcesPage";
import ApplicationsGuide from "@/pages/ApplicationsGuide";
import SoftwareTools from "@/pages/SoftwareTools";
import Downloads from "@/pages/Downloads";
import Suggestions from "@/pages/Suggestions";
import RevisionHistory from "@/pages/RevisionHistory";
import ScopeLimitations from "@/pages/ScopeLimitations";
import UnexpectedObservations from "@/pages/UnexpectedObservations";
import MonoisotopicPeakSelection from "@/pages/MonoisotopicPeakSelection";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/diagnostic-ions" component={Home} />
      <Route path="/applications" component={ApplicationsGuide} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/monoisotopic-peak-selection" component={MonoisotopicPeakSelection} />
      <Route path="/unexpected-observations" component={UnexpectedObservations} />
      <Route path="/software" component={SoftwareTools} />
      <Route path="/nomenclature" component={NomenclatureGuide} />
      <Route path="/monosaccharides-modifications" component={MonosaccharidesModifications} />
      <Route path="/resources" component={ResourcesPage} />
      <Route path="/references" component={ReferencesPage} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/revision-history" component={RevisionHistory} />
      <Route path="/scope-limitations" component={ScopeLimitations} />
      <Route path="/suggestions" component={Suggestions} />
      {/* Keep the previous combined URL working for existing bookmarks. */}
      <Route path="/downloads-feedback" component={Downloads} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <Router />
          <AppFooter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
