import { useParams, useNavigate } from 'react-router-dom';
import { useActivity, getEffectiveStatus } from '@/features/activities/hooks/useActivities';
import { useIsUserRegistered, useRegisterForActivity } from '@/features/registrations/hooks/useRegistrations';
import { useAuth } from '@/features/auth/context/AuthContext';
import { StatusBadge, TypeBadge } from '@/shared/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: activity, isLoading } = useActivity(id);
  const { user } = useAuth();
  const { data: isRegistered = false } = useIsUserRegistered(id);
  const registerMutation = useRegisterForActivity();

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  if (!activity) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">Atividade não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/atividades')}>Voltar</Button>
      </div>
    );
  }

  const status = getEffectiveStatus(activity);
  const canRegister = status === 'aberta' && !isRegistered && !!user;

  const handleRegister = async () => {
    if (!user) {
      toast({ title: 'Faça login', description: 'Você precisa estar logada para se inscrever.', variant: 'destructive' });
      navigate('/login');
      return;
    }
    try {
      const result = await registerMutation.mutateAsync({ activityId: activity.id, userId: user.id });
      toast({
        title: result.success ? 'Sucesso!' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao inscrever.', variant: 'destructive' });
    }
  };

  const getButtonState = () => {
    if (isRegistered) return { label: 'Inscrita ✓', disabled: true };
    if (status === 'lotada') return { label: 'Sem vagas', disabled: true };
    if (status === 'encerrada') return { label: 'Encerrada', disabled: true };
    if (status === 'cancelada') return { label: 'Cancelada', disabled: true };
    if (!user) return { label: 'Faça login para inscrever-se', disabled: false };
    return { label: 'Inscrever-se', disabled: false };
  };

  const btn = getButtonState();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate('/atividades')}>
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="flex flex-wrap gap-2 mb-4">
        <TypeBadge type={activity.type} />
        <StatusBadge status={status} />
      </div>

      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">{activity.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          <p className="text-muted-foreground leading-relaxed text-lg">{activity.description}</p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{format(new Date(activity.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium">
                    {format(new Date(activity.start_date), 'HH:mm')} - {format(new Date(activity.end_date), 'HH:mm')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                  <p className="font-medium">{activity.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Vagas</p>
                  <p className={`font-medium ${status === 'lotada' ? 'text-status-full' : ''}`}>
                    {activity.available_slots}/{activity.total_slots} disponíveis
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={btn.disabled || registerMutation.isPending}
                  onClick={handleRegister}
                  variant={isRegistered ? 'outline' : 'default'}
                >
                  {isRegistered && <CheckCircle2 className="h-4 w-4" />}
                  {registerMutation.isPending ? 'Inscrevendo...' : btn.label}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
