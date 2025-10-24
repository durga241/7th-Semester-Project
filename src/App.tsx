import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import FarmerLogin from "./pages/FarmerLogin";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomerDashboard from "./pages/CustomerDashboard";
import FarmerDashboard from "./pages/FarmerDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main marketplace page */}
          <Route path="/" element={<Index />} />
          
          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/farmer/login" element={<FarmerLogin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Dashboard routes */}
          <Route path="/marketplace" element={<Index />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/cart" element={<CustomerDashboard />} />
          <Route path="/customer/orders" element={<CustomerDashboard />} />
          <Route path="/customer/wishlist" element={<CustomerDashboard />} />
          <Route path="/customer/products" element={<CustomerDashboard />} />
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          
          {/* Customer section routes */}
          <Route path="/myorders" element={<Index />} />
          <Route path="/wishlist" element={<Index />} />
          <Route path="/editprofile" element={<Index />} />
          <Route path="/products" element={<Index />} />
          <Route path="/contact" element={<Index />} />
          
          {/* Payment routes */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
