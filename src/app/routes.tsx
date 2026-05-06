import { Route, Routes } from "react-router-dom";
import { Navbar } from "@/shared/components/Navbar";
import Home from "@/features/activities/pages/Home";
import Activities from "@/features/activities/pages/Activities";
import ActivityDetail from "@/features/activities/pages/ActivityDetail";
import Login from "@/features/auth/pages/Login";
import Register from "@/features/auth/pages/Register";
import MyRegistrations from "@/features/registrations/pages/MyRegistrations";
import Profile from "@/features/profile/pages/Profile";
import AdminLayout from "@/features/admin/layouts/AdminLayout";
import AdminDashboard from "@/features/admin/pages/Dashboard";
import AdminActivities from "@/features/admin/pages/AdminActivities";
import AdminRegistrations from "@/features/admin/pages/AdminRegistrations";
import NotFound from "@/pages/NotFound";

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    {children}
  </>
);

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
    <Route path="/atividades" element={<PublicLayout><Activities /></PublicLayout>} />
    <Route path="/atividades/:id" element={<PublicLayout><ActivityDetail /></PublicLayout>} />
    <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
    <Route path="/cadastro" element={<PublicLayout><Register /></PublicLayout>} />
    <Route path="/minhas-inscricoes" element={<PublicLayout><MyRegistrations /></PublicLayout>} />
    <Route path="/perfil" element={<PublicLayout><Profile /></PublicLayout>} />

    <Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminDashboard />} />
      <Route path="atividades" element={<AdminActivities />} />
      <Route path="atividades/:id/inscritas" element={<AdminRegistrations />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);
