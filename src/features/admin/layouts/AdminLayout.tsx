import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  SidebarProvider, SidebarTrigger, Sidebar, SidebarContent,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/shared/components/NavLink';
import { LayoutDashboard, BookOpen, ArrowLeft } from 'lucide-react';

const items = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Atividades', url: '/admin/atividades', icon: BookOpen },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          {!collapsed && (
            <Link to="/" className="text-sidebar-foreground/70 text-xs flex items-center gap-1 hover:text-sidebar-foreground transition-colors mb-4">
              <ArrowLeft className="h-3 w-3" /> Voltar ao site
            </Link>
          )}
          {!collapsed && (
            <h2 className="font-heading font-bold text-sidebar-foreground text-lg">Admin</h2>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) return <Navigate to="/" />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4">
            <SidebarTrigger className="mr-4" />
            <span className="font-heading font-semibold text-sm text-muted-foreground">Painel Administrativo</span>
          </header>
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
