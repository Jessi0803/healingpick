import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CatCompanion from "./components/CatCompanion";
import Home from "./pages/Home";
import Tarot from "./pages/Tarot";
import Ziwei from "./pages/Ziwei";
import Fortune from "./pages/Fortune";
import Treehole from "./pages/Treehole";
import Shop from "./pages/Shop";
import History from "./pages/History";
import Buy from "./pages/Buy";
import LoginDialog from "./components/LoginDialog";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tarot" component={Tarot} />
      <Route path="/ziwei" component={Ziwei} />
      <Route path="/fortune" component={Fortune} />
      <Route path="/fortune/daily" component={Fortune} />
      <Route path="/treehole" component={Treehole} />
      <Route path="/shop" component={Shop} />
      <Route path="/history" component={History} />
      <Route path="/buy" component={Buy} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <CatCompanion />
          <LoginDialog />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
