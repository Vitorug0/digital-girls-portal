import { Activity } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { StatusBadge, TypeBadge } from '@/components/StatusBadge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { getEffectiveStatus } = useData();
  const status = getEffectiveStatus(activity);
  const isClosed = status === 'encerrada' || status === 'cancelada';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.15 }}
    >
      <Link to={`/atividades/${activity.id}`}>
        <Card className={`h-full transition-shadow duration-150 hover:shadow-lg ${isClosed ? 'opacity-60' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={activity.type} />
              <StatusBadge status={status} />
            </div>
            <h3 className="font-heading font-semibold text-lg leading-tight line-clamp-2">
              {activity.title}
            </h3>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {activity.description}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{format(new Date(activity.start_date), "dd 'de' MMM, HH:mm", { locale: ptBR })}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{activity.location}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className={status === 'lotada' ? 'text-status-full font-medium' : 'text-muted-foreground'}>
                {activity.available_slots === 0
                  ? 'Sem vagas'
                  : `${activity.available_slots}/${activity.total_slots} vagas`}
              </span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
