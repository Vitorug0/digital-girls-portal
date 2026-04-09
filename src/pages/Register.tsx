import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'externo' | 'interno'>('externo');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(name, email, password, userType);
    setLoading(false);
    if (result.success) {
      toast({ title: 'Conta criada!', description: 'Bem-vinda ao Meninas Digitais. Verifique seu email para confirmar a conta.' });
      navigate('/');
    } else {
      toast({ title: 'Erro', description: result.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">Cadastro</CardTitle>
          <CardDescription>Crie sua conta no Meninas Digitais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de usuária</Label>
              <div className="flex gap-3">
                <Button type="button" variant={userType === 'externo' ? 'default' : 'outline'} className="flex-1" onClick={() => setUserType('externo')}>
                  Externa
                </Button>
                <Button type="button" variant={userType === 'interno' ? 'default' : 'outline'} className="flex-1" onClick={() => setUserType('interno')}>
                  Integrante
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {userType === 'externo' ? 'Participante de atividades do projeto' : 'Membro da equipe Meninas Digitais'}
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary hover:underline">Entrar</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
