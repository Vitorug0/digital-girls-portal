import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Registration, Activity } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useRegistrations(activityId: string | undefined) {
  return useQuery({
    queryKey: ['registrations', activityId],
    queryFn: async (): Promise<Registration[]> => {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('activity_id', activityId!)
        .neq('status', 'cancelada')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as Registration[];
    },
    enabled: !!activityId,
  });
}

export function useUserRegistrations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['user-registrations', user?.id],
    queryFn: async (): Promise<(Registration & { activity: Activity })[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('registrations')
        .select('*, activities(*)')
        .eq('user_id', user.id)
        .neq('status', 'cancelada')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        activity_id: r.activity_id,
        user_id: r.user_id,
        status: r.status,
        created_at: r.created_at,
        activity: r.activities as Activity,
      })).filter(r => r.activity);
    },
    enabled: !!user,
  });
}

export function useIsUserRegistered(activityId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['is-registered', activityId, user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user || !activityId) return false;
      const { data, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', user.id)
        .neq('status', 'cancelada')
        .limit(1);
      if (error) throw error;
      return (data || []).length > 0;
    },
    enabled: !!user && !!activityId,
  });
}

export function useRegisterForActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ activityId, userId }: { activityId: string; userId: string }) => {
      const { data, error } = await supabase.rpc('register_for_activity', {
        p_activity_id: activityId,
        p_user_id: userId,
      });
      if (error) throw error;
      return data as { success: boolean; message: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['registrations'] });
      qc.invalidateQueries({ queryKey: ['user-registrations'] });
      qc.invalidateQueries({ queryKey: ['is-registered'] });
    },
  });
}

export function useCancelRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, userId }: { registrationId: string; userId: string }) => {
      const { data, error } = await supabase.rpc('cancel_registration', {
        p_registration_id: registrationId,
        p_user_id: userId,
      });
      if (error) throw error;
      return data as { success: boolean; message: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] });
      qc.invalidateQueries({ queryKey: ['registrations'] });
      qc.invalidateQueries({ queryKey: ['user-registrations'] });
      qc.invalidateQueries({ queryKey: ['is-registered'] });
    },
  });
}

export function useUpdateRegistrationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ registrationId, status }: { registrationId: string; status: string }) => {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', registrationId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}
