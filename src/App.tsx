import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PropertyProof from "./pages/PropertyProof";
import LawEnforcement from "./pages/LawEnforcement";
import PropertyRoom from "./pages/PropertyRoom";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Emily from "./pages/Emily";
import PropertyDetail from "./pages/PropertyDetail";
import LeLogin from "./pages/le/LeLogin";
import LeDashboard from "./pages/le/LeDashboard";
import LeSearch from "./pages/le/LeSearch";
import LeHistory from "./pages/le/LeHistory";
import LeRegistry from "./pages/le/LeRegistry";

import LePanelLayout from "./components/LePanelLayout";

const queryClient = new QueryClient();

const LePanel = () => {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <LeLogin onLogin={() => setAuthed(true)} />;
  return (
    <LePanelLayout onLogout={() => setAuthed(false)}>
      <Routes>
        <Route path="/" element={<LeDashboard />} />
        <Route path="/search" element={<LeSearch />} />
        <Route path="/history" element={<LeHistory />} />
        <Route path="/registry" element={<LeRegistry />} />

        <Route path="*" element={<LeDashboard />} />
      </Routes>
    </LePanelLayout>
  );
};

const ResidentApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

  return (
    <Routes>
      <Route path="/" element={<Index onLogout={handleLogout} />} />
      <Route path="/emily" element={<Emily onLogout={handleLogout} />} />
      <Route path="/property-proof" element={<PropertyProof onLogout={handleLogout} />} />
      <Route path="/property/:id" element={<PropertyDetail onLogout={handleLogout} />} />
      <Route path="/law-enforcement" element={<LawEnforcement onLogout={handleLogout} />} />
      <Route path="/property-room" element={<PropertyRoom onLogout={handleLogout} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/le/*" element={<LePanel />} />
          <Route path="/*" element={<ResidentApp />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
