import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, TypeBadge, RegistrationStatusBadge } from '@/components/StatusBadge';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MapPin, X } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function MyRegistrations() {
  const { user } = useAuth();
  const { getUserRegistrations, cancelRegistration, getEffectiveStatus } = useData();

  if (!user) return <Navigate to="/login" />;

  const registrations = getUserRegistrations(user.id);

  const handleCancel = (regId: string) => {
    cancelRegistration(regId);
    toast({ title: 'Inscrição cancelada', description: 'Sua vaga foi liberada.' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Minhas Inscrições</h1>
      <p className="text-muted-foreground mb-8">Acompanhe suas atividades inscritas</p>

      {registrations.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg mb-4">Você ainda não se inscreveu em nenhuma atividade.</p>
          <Link to="/atividades">
            <Button>Explorar atividades</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map(reg => {
            const status = getEffectiveStatus(reg.activity);
            return (
              <Card key={reg.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <TypeBadge type={reg.activity.type} />
                        <StatusBadge status={status} />
                        <RegistrationStatusBadge status={reg.status} />
                      </div>
                      <Link to={`/atividades/${reg.activity.id}`}>
                        <h3 className="font-heading font-semibold text-lg hover:text-primary transition-colors">
                          {reg.activity.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(reg.activity.start_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {reg.activity.location}
                        </span>
                      </div>
                    </div>
                    {reg.status === 'inscrita' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleCancel(reg.id)}
                      >
                        <X className="h-4 w-4" /> Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
