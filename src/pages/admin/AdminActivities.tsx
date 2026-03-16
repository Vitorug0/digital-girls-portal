import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Activity, ActivityType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge, TypeBadge } from '@/components/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Navigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminActivities() {
  const { user, isAdmin } = useAuth();
  const { activities, addActivity, updateActivity, deleteActivity, getEffectiveStatus } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  if (!user || !isAdmin) return <Navigate to="/" />;

  const emptyForm = {
    title: '', description: '', type: 'oficina' as ActivityType, start_date: '', end_date: '',
    location: '', total_slots: 30, available_slots: 30, status: 'aberta' as const, created_by: user.id,
  };

  const [form, setForm] = useState(emptyForm);

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (a: Activity) => { setEditing(a); setForm({ ...a }); setDialogOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.total_slots < 1) {
      toast({ title: 'Erro', description: 'A atividade deve ter pelo menos 1 vaga.', variant: 'destructive' });
      return;
    }
    if (editing) {
      updateActivity(editing.id, form);
      toast({ title: 'Atualizada!', description: 'Atividade atualizada com sucesso.' });
    } else {
      addActivity({ ...form, available_slots: form.total_slots });
      toast({ title: 'Criada!', description: 'Atividade criada com sucesso.' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteActivity(id);
    toast({ title: 'Excluída', description: 'Atividade removida.' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Atividades</h1>
          <p className="text-muted-foreground">Gerencie oficinas, minicursos e palestras</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openNew}>
              <Plus className="h-4 w-4" /> Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">{editing ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as ActivityType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="minicurso">Minicurso</SelectItem>
                      <SelectItem value="palestra">Palestra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data/hora início</Label>
                  <Input type="datetime-local" value={form.start_date ? form.start_date.slice(0, 16) : ''} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Data/hora fim</Label>
                  <Input type="datetime-local" value={form.end_date ? form.end_date.slice(0, 16) : ''} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total de vagas</Label>
                  <Input type="number" min={1} value={form.total_slots} onChange={e => setForm({ ...form, total_slots: parseInt(e.target.value) || 0 })} required />
                </div>
                {editing && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aberta">Aberta</SelectItem>
                        <SelectItem value="encerrada">Encerrada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">{editing ? 'Salvar Alterações' : 'Criar Atividade'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atividade</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Vagas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map(a => {
                const status = getEffectiveStatus(a);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{a.title}</TableCell>
                    <TableCell><TypeBadge type={a.type} /></TableCell>
                    <TableCell className="text-sm">{format(new Date(a.start_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{a.available_slots}/{a.total_slots}</TableCell>
                    <TableCell><StatusBadge status={status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/atividades/${a.id}/inscritas`}>
                          <Button variant="ghost" size="icon" title="Ver inscritas">
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} title="Excluir" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
