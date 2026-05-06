import { useAuth } from '@/features/auth/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigate } from 'react-router-dom';
import { User } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="font-heading text-3xl font-bold mb-8">Meu Perfil</h1>
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tipo de conta</p>
              <Badge variant={user.user_type === 'interno' ? 'default' : 'secondary'}>
                {user.user_type === 'interno' ? 'Integrante' : 'Externa'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
