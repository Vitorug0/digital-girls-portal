import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ActivityCard } from '@/components/ActivityCard';
import { useData } from '@/contexts/DataContext';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Sparkles } from 'lucide-react';

export default function Home() {
  const { activities, getEffectiveStatus } = useData();
  const upcomingActivities = activities
    .filter(a => getEffectiveStatus(a) === 'aberta')
    .slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Inspirando <span className="text-primary">meninas</span> a transformar o mundo com{' '}
              <span className="text-secondary">tecnologia</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              O projeto Meninas Digitais UTFPR-CP promove oficinas, minicursos e palestras para despertar o interesse de meninas e mulheres pela área de computação e tecnologia.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/atividades">
                <Button size="lg" className="gap-2">
                  Ver atividades <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button size="lg" variant="outline" className="gap-2">
                  Cadastre-se
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, label: 'Atividades', value: activities.length.toString(), desc: 'Oficinas, minicursos e palestras' },
              { icon: Users, label: 'Participantes', value: '200+', desc: 'Meninas impactadas pelo projeto' },
              { icon: Sparkles, label: 'Desde', value: '2020', desc: 'Inspirando meninas na tecnologia' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="font-heading text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming activities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold">Próximas Atividades</h2>
              <p className="text-muted-foreground mt-1">Confira as atividades disponíveis para inscrição</p>
            </div>
            <Link to="/atividades">
              <Button variant="outline" className="gap-2 hidden sm:flex">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {upcomingActivities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingActivities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12">
              Nenhuma atividade disponível no momento.
            </p>
          )}
          <div className="mt-6 text-center sm:hidden">
            <Link to="/atividades">
              <Button variant="outline" className="gap-2">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
