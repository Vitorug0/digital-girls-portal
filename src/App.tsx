import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { Navbar } from "@/shared/components/Navbar";
import Home from "@/pages/Home";
import Activities from "@/pages/Activities";
import ActivityDetail from "@/pages/ActivityDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import MyRegistrations from "@/pages/MyRegistrations";
import Profile from "@/pages/Profile";
import AdminLayout from "@/features/admin/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminActivities from "@/pages/admin/AdminActivities";
import AdminRegistrations from "@/pages/admin/AdminRegistrations";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes with Navbar */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/atividades" element={<PublicLayout><Activities /></PublicLayout>} />
            <Route path="/atividades/:id" element={<PublicLayout><ActivityDetail /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/cadastro" element={<PublicLayout><Register /></PublicLayout>} />
            <Route path="/minhas-inscricoes" element={<PublicLayout><MyRegistrations /></PublicLayout>} />
            <Route path="/perfil" element={<PublicLayout><Profile /></PublicLayout>} />

            {/* Admin routes with sidebar layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="atividades" element={<AdminActivities />} />
              <Route path="atividades/:id/inscritas" element={<AdminRegistrations />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
