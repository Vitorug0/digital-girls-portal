import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-sm">MD</span>
          </div>
          <span className="font-heading font-semibold text-lg hidden sm:block">Meninas Digitais</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Início
          </Link>
          <Link to="/atividades" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Atividades
          </Link>
          {user && (
            <Link to="/minhas-inscricoes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Minhas Inscrições
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              Painel Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/perfil">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {user.name.split(' ')[0]}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => { logout(); navigate('/'); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm">Cadastrar</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          <Link to="/" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Início</Link>
          <Link to="/atividades" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Atividades</Link>
          {user && (
            <Link to="/minhas-inscricoes" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Minhas Inscrições</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="block text-sm font-medium text-primary py-2" onClick={() => setMobileOpen(false)}>Painel Admin</Link>
          )}
          <div className="pt-2 border-t flex gap-2">
            {user ? (
              <>
                <Link to="/perfil" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm">Perfil</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}>Sair</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to="/cadastro" onClick={() => setMobileOpen(false)}>
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
