import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Tarot from "./pages/Tarot";
import TarotKnowledge from "./pages/TarotKnowledge";
import TarotReviews from "./pages/TarotReviews";
import TarotTeacher from "./pages/TarotTeacher";
import Ziwei from "./pages/Ziwei";
import Dream from "./pages/Dream";
import Fortune from "./pages/Fortune";
import Quiz from "./pages/Quiz";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import CustomBracelet from "./pages/CustomBracelet";
import History from "./pages/History";
import Buy from "./pages/Buy";
import Policy from "./pages/Policy";
import ResetPassword from "./pages/ResetPassword";
import LoginDialog from "./components/LoginDialog";
import MochiWelcomeLetter from "./components/MochiWelcomeLetter";
import PostcardMailbox from "./components/PostcardMailbox";
import Admin from "./pages/Admin";
import Seo from "./components/Seo";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/tarot/knowledge" component={TarotKnowledge} />
      <Route path="/tarot/reviews" component={TarotReviews} />
      <Route path="/tarot/teacher" component={TarotTeacher} />
      <Route path="/tarot" component={Tarot} />
      <Route path="/ziwei" component={Ziwei} />
      <Route path="/dream" component={Dream} />
      <Route path="/fortune" component={Fortune} />
      <Route path="/fortune/daily" component={Fortune} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/custom-bracelet/general" component={CustomBracelet} />
      <Route path="/shop/:id" component={ProductDetail} />
      <Route path="/history" component={History} />
      <Route path="/buy" component={Buy} />
      <Route path="/policy" component={Policy} />
      <Route path="/admin" component={Admin} />
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
          <Seo />
          <Router />
          <MochiWelcomeLetter />
          <PostcardMailbox />
          <LoginDialog />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
