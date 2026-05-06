import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from '@/types';

function mapRow(row: any): Activity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    start_date: row.start_date,
    end_date: row.end_date,
    location: row.location,
    total_slots: row.total_slots,
    available_slots: row.available_slots,
    status: row.status,
    created_by: row.created_by,
  };
}

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('start_date', { ascending: true });
      if (error) throw error;
      return (data || []).map(mapRow);
    },
  });
}

export function useActivity(id: string | undefined) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: async (): Promise<Activity | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data ? mapRow(data) : null;
    },
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activity: Omit<Activity, 'id'>) => {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          title: activity.title,
          description: activity.description,
          type: activity.type,
          start_date: activity.start_date,
          end_date: activity.end_date,
          location: activity.location,
          total_slots: activity.total_slots,
          available_slots: activity.available_slots,
          status: activity.status,
          created_by: activity.created_by,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Activity> }) => {
      const { error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function getEffectiveStatus(activity: Activity): 'aberta' | 'encerrada' | 'cancelada' | 'lotada' {
  if (activity.status === 'cancelada') return 'cancelada';
  if (activity.status === 'encerrada' || new Date(activity.end_date) < new Date()) return 'encerrada';
  if (activity.available_slots <= 0) return 'lotada';
  return 'aberta';
}
