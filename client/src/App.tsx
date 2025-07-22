import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import TradeIn from "./pages/TradeIn";
import Services from "./pages/Services";
import Admin from "./pages/Admin";
import Fleet from "./pages/Fleet";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/trade-in" component={TradeIn} />
        <Route path="/services" component={Services} />
        <Route path="/admin" component={Admin} />
        <Route path="/fleet" component={Fleet} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
