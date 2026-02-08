import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import SubmitCoupon from "@/pages/SubmitCoupon";
import Categories from "@/pages/Categories";
import CouponsList from "@/pages/CouponsList";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import ManageCoupons from "@/pages/admin/ManageCoupons";
import BrandPage from "@/pages/BrandPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/submit" component={SubmitCoupon} />
      <Route path="/categories" component={Categories} />
      <Route path="/coupons" component={CouponsList} />
      <Route path="/brand/:slug" component={BrandPage} />
      <Route path="/profile" component={Profile} />

      {/* Admin Routes */}
      <Route path="/admin">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/admin/coupons">
        {() => (
          <AdminLayout>
            <ManageCoupons />
          </AdminLayout>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
