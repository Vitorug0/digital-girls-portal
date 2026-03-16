import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RegistrationStatusBadge } from '@/components/StatusBadge';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminRegistrations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { activities, getActivityRegistrations, updateRegistrationStatus } = useData();

  if (!user || !isAdmin) return <Navigate to="/" />;

  const activity = activities.find(a => a.id === id);
  if (!activity) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Atividade não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/atividades')}>Voltar</Button>
      </div>
    );
  }

  const regs = getActivityRegistrations(activity.id);
  const hasStarted = new Date(activity.start_date) <= new Date();

  const markPresent = (regId: string) => {
    updateRegistrationStatus(regId, 'presente');
    toast({ title: 'Presença registrada!' });
  };

  return (
    <div>
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => navigate('/admin/atividades')}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>
      <h1 className="font-heading text-2xl font-bold mb-1">Inscritas — {activity.title}</h1>
      <p className="text-muted-foreground mb-6">{regs.length} inscrição(ões) ativa(s)</p>

      {!hasStarted && (
        <p className="text-sm text-status-full bg-status-full/10 px-4 py-2 rounded-lg mb-4">
          A marcação de presença estará disponível após o início da atividade.
        </p>
      )}

      {regs.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Nenhuma inscrição nesta atividade.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>ID Usuária</TableHead>
                <TableHead>Data Inscrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Presença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regs.map((reg, i) => (
                <TableRow key={reg.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{reg.user_id}</TableCell>
                  <TableCell>{format(new Date(reg.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell><RegistrationStatusBadge status={reg.status} /></TableCell>
                  <TableCell className="text-right">
                    {reg.status === 'presente' ? (
                      <span className="text-status-open text-sm font-medium">✓ Presente</span>
                    ) : hasStarted ? (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => markPresent(reg.id)}>
                        <Check className="h-3.5 w-3.5" /> Marcar
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
