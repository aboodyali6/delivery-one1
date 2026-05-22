import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import HomePage from "@/pages/home";
import OrdersPage from "@/pages/orders";
import DeliverersPage from "@/pages/deliverers";
import RestaurantsPage from "@/pages/restaurants";
import LocationsPage from "@/pages/locations";
import { AuthProvider } from "@/context/auth";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/home" component={HomePage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/deliverers" component={DeliverersPage} />
      <Route path="/restaurants" component={RestaurantsPage} />
      <Route path="/locations" component={LocationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
