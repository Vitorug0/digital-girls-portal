import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { BarChart3, BookOpen, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { activities, registrations } = useData();

  if (!user || !isAdmin) return <Navigate to="/" />;

  const totalActivities = activities.length;
  const totalRegistrations = registrations.filter(r => r.status !== 'cancelada').length;
  const activeRegistrations = registrations.filter(r => r.status === 'inscrita' || r.status === 'confirmada').length;

  const popularActivities = activities
    .map(a => ({
      name: a.title.length > 25 ? a.title.slice(0, 25) + '...' : a.title,
      inscrições: registrations.filter(r => r.activity_id === a.id && r.status !== 'cancelada').length,
    }))
    .sort((a, b) => b.inscrições - a.inscrições)
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Visão geral do projeto Meninas Digitais</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Atividades', value: totalActivities, color: 'text-primary' },
          { icon: Users, label: 'Inscrições', value: totalRegistrations, color: 'text-secondary' },
          { icon: TrendingUp, label: 'Inscrições Ativas', value: activeRegistrations, color: 'text-status-open' },
          { icon: BarChart3, label: 'Taxa de Ocupação', value: `${Math.round((1 - activities.reduce((s, a) => s + a.available_slots, 0) / activities.reduce((s, a) => s + a.total_slots, 0)) * 100)}%`, color: 'text-status-full' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-heading font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Atividades Mais Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularActivities}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
              />
              <Bar dataKey="inscrições" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
