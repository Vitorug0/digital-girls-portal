import { ActivityStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'aberta' | 'encerrada' | 'cancelada' | 'lotada';
  className?: string;
}

const statusConfig = {
  aberta: { label: 'Aberta', className: 'bg-status-open text-status-open-foreground hover:bg-status-open/80' },
  lotada: { label: 'Lotada', className: 'bg-status-full text-status-full-foreground hover:bg-status-full/80' },
  encerrada: { label: 'Encerrada', className: 'bg-status-closed text-status-closed-foreground hover:bg-status-closed/80' },
  cancelada: { label: 'Cancelada', className: 'bg-muted text-muted-foreground hover:bg-muted/80' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge className={cn('border-0', config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const labels: Record<string, string> = {
    oficina: 'Oficina',
    minicurso: 'Minicurso',
    palestra: 'Palestra',
  };
  return (
    <Badge variant="outline" className="border-primary/30 text-primary">
      {labels[type] || type}
    </Badge>
  );
}

export function RegistrationStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    inscrita: { label: 'Inscrita', className: 'bg-primary/10 text-primary border-primary/20' },
    confirmada: { label: 'Confirmada', className: 'bg-status-open/10 text-status-open border-status-open/20' },
    cancelada: { label: 'Cancelada', className: 'bg-muted text-muted-foreground' },
    presente: { label: 'Presente', className: 'bg-status-open text-status-open-foreground' },
  };
  const c = config[status] || config.inscrita;
  return <Badge className={cn('border', c.className)}>{c.label}</Badge>;
}
