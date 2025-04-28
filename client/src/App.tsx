import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useDeviceDetect } from "@/hooks/useDeviceDetect";
import MobileApp from "@/components/MobileApp";
import Dashboard from "@/components/Dashboard";
import { DisasterProvider } from "@/context/DisasterContext";

function App() {
  const { isMobile } = useDeviceDetect();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DisasterProvider>
          <Toaster />
          {isMobile ? <MobileApp /> : <Dashboard />}
        </DisasterProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
