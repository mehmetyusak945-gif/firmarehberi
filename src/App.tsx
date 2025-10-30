import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Category from "./pages/Category";
import FirmaDetail from "./pages/FirmaDetail";
import FirmaEkle from "./pages/FirmaEkle";
import Iletisim from "./pages/Iletisim";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Page from "./pages/Page";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/kategori/:category" element={<Category />} />
          <Route path="/firma/:slug" element={<FirmaDetail />} />
          <Route path="/firma-ekle" element={<FirmaEkle />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/:slug" element={<Page />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
