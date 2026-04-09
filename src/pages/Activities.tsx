import { useState, useMemo } from 'react';
import { useActivities } from '@/hooks/useActivities';
import { ActivityCard } from '@/components/ActivityCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ActivityType } from '@/types';

const typeFilters: { label: string; value: ActivityType | 'all' }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Oficinas', value: 'oficina' },
  { label: 'Minicursos', value: 'minicurso' },
  { label: 'Palestras', value: 'palestra' },
];

export default function Activities() {
  const { data: activities = [], isLoading } = useActivities();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');

  const filtered = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || a.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [activities, search, typeFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Atividades</h1>
        <p className="text-muted-foreground">Explore oficinas, minicursos e palestras disponíveis</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atividades..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeFilters.map(f => (
            <Button
              key={f.value}
              variant={typeFilter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-12">Carregando...</p>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">Nenhuma atividade encontrada.</p>
        </div>
      )}
    </div>
  );
}
