import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CatCompanion from "./components/CatCompanion";
import Home from "./pages/Home";
import About from "./pages/About";
import Tarot from "./pages/Tarot";
import Ziwei from "./pages/Ziwei";
import Fortune from "./pages/Fortune";
import Treehole from "./pages/Treehole";
import Quiz from "./pages/Quiz";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import History from "./pages/History";
import Buy from "./pages/Buy";
import ResetPassword from "./pages/ResetPassword";
import LoginDialog from "./components/LoginDialog";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/tarot" component={Tarot} />
      <Route path="/ziwei" component={Ziwei} />
      <Route path="/fortune" component={Fortune} />
      <Route path="/fortune/daily" component={Fortune} />
      <Route path="/treehole" component={Treehole} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/:id" component={ProductDetail} />
      <Route path="/history" component={History} />
      <Route path="/buy" component={Buy} />
      <Route path="/reset-password" component={ResetPassword} />
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
