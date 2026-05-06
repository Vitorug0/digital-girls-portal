import { useAuth } from '@/features/auth/context/AuthContext';
import { useUserRegistrations, useCancelRegistration } from '@/features/registrations/hooks/useRegistrations';
import { getEffectiveStatus } from '@/features/activities/hooks/useActivities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, TypeBadge, RegistrationStatusBadge } from '@/shared/components/StatusBadge';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, MapPin, X } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function MyRegistrations() {
  const { user } = useAuth();
  const { data: registrations = [], isLoading } = useUserRegistrations();
  const cancelMutation = useCancelRegistration();

  if (!user) return <Navigate to="/login" />;

  const handleCancel = async (regId: string) => {
    try {
      const result = await cancelMutation.mutateAsync({ registrationId: regId, userId: user.id });
      toast({
        title: result.success ? 'Inscrição cancelada' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-2">Minhas Inscrições</h1>
      <p className="text-muted-foreground mb-8">Acompanhe suas atividades inscritas</p>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-12">Carregando...</p>
      ) : registrations.length === 0 ? (
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
                        disabled={cancelMutation.isPending}
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
