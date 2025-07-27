import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { WorkOrders } from "./pages/WorkOrders";
import { WorkOrderDetail } from "./pages/WorkOrderDetail";
import { QRScanner } from "./pages/QRScanner";
import { CreateWorkOrderFromQR } from "./pages/CreateWorkOrderFromQR";
import { CreateWorkOrder } from "./pages/CreateWorkOrder";
import { Assets } from "./pages/Assets";
import { AssetDetail } from "./pages/AssetDetail";
import { Parts } from "./pages/Parts";
import { PartDetail } from "./pages/PartDetail";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { Schedule } from "./pages/Schedule";
import { Reports } from "./pages/Reports";
import { MobileNav } from "./components/MobileNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <MobileNav />

          {/* Main Content */}
          <main className="md:ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/work-orders/new" element={<CreateWorkOrder />} />
              <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
              <Route path="/qr-scanner" element={<QRScanner />} />
              <Route
                path="/create-work-order"
                element={<CreateWorkOrderFromQR />}
              />
              <Route path="/assets" element={<Assets />} />
              <Route path="/assets/:id" element={<AssetDetail />} />

              <Route path="/schedule" element={<Schedule />} />
              <Route path="/parts" element={<Parts />} />
              <Route path="/parts/:id" element={<PartDetail />} />
              <Route
                path="/settings"
                element={
                  <PlaceholderPage
                    title="Settings"
                    description="Configure your CMMS Mobile Pro application"
                    features={[
                      "User profile management",
                      "Company and location setup",
                      "Notification preferences",
                      "Data sync settings",
                      "Security and access controls",
                    ]}
                  />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
