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
import { PlaceholderPage } from "./pages/PlaceholderPage";
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
              <Route
                path="/assets"
                element={
                  <PlaceholderPage
                    title="Assets Management"
                    description="Manage and track all your agricultural equipment and machinery"
                    features={[
                      "Equipment inventory tracking",
                      "Asset maintenance history",
                      "QR code assignment and management",
                      "Asset performance analytics",
                      "Location tracking and mapping"
                    ]}
                  />
                }
              />
              <Route
                path="/qr-scanner"
                element={
                  <PlaceholderPage
                    title="QR Code Scanner"
                    description="Scan equipment QR codes to instantly start maintenance tasks"
                    features={[
                      "Camera-based QR code scanning",
                      "Instant PM task initiation",
                      "Asset identification and lookup",
                      "Offline scanning capability",
                      "History of scanned items"
                    ]}
                  />
                }
              />
              <Route
                path="/schedule"
                element={
                  <PlaceholderPage
                    title="Maintenance Schedule"
                    description="View and manage preventive maintenance schedules"
                    features={[
                      "Calendar view of scheduled maintenance",
                      "Frequency-based task planning",
                      "Team workload distribution",
                      "Automated scheduling suggestions",
                      "Schedule conflict resolution"
                    ]}
                  />
                }
              />
              <Route
                path="/parts"
                element={
                  <PlaceholderPage
                    title="Parts Inventory"
                    description="Manage spare parts and inventory for maintenance operations"
                    features={[
                      "Real-time inventory tracking",
                      "Low stock alerts and notifications",
                      "Parts usage analytics",
                      "Supplier management",
                      "Automated reorder suggestions"
                    ]}
                  />
                }
              />
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
                      "Security and access controls"
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
