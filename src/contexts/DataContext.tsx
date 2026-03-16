import React, { createContext, useContext, useState, useCallback } from 'react';
import { Activity, Registration, RegistrationStatus } from '@/types';
import { mockActivities, mockRegistrations } from '@/data/mockData';

interface DataContextType {
  activities: Activity[];
  registrations: Registration[];
  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  registerForActivity: (activityId: string, userId: string) => { success: boolean; message: string };
  cancelRegistration: (registrationId: string) => void;
  updateRegistrationStatus: (registrationId: string, status: RegistrationStatus) => void;
  getUserRegistrations: (userId: string) => (Registration & { activity: Activity })[];
  getActivityRegistrations: (activityId: string) => Registration[];
  isUserRegistered: (activityId: string, userId: string) => boolean;
  getEffectiveStatus: (activity: Activity) => 'aberta' | 'encerrada' | 'cancelada' | 'lotada';
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);

  const getEffectiveStatus = useCallback((activity: Activity): 'aberta' | 'encerrada' | 'cancelada' | 'lotada' => {
    if (activity.status === 'cancelada') return 'cancelada';
    if (activity.status === 'encerrada' || new Date(activity.end_date) < new Date()) return 'encerrada';
    if (activity.available_slots <= 0) return 'lotada';
    return 'aberta';
  }, []);

  const addActivity = useCallback((activity: Omit<Activity, 'id'>) => {
    const newActivity: Activity = { ...activity, id: `act_${Date.now()}` };
    setActivities(prev => [...prev, newActivity]);
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    setRegistrations(prev => prev.filter(r => r.activity_id !== id));
  }, []);

  const registerForActivity = useCallback((activityId: string, userId: string): { success: boolean; message: string } => {
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return { success: false, message: 'Atividade não encontrada.' };

    const status = getEffectiveStatus(activity);
    if (status === 'encerrada') return { success: false, message: 'Esta atividade já foi encerrada.' };
    if (status === 'cancelada') return { success: false, message: 'Esta atividade foi cancelada.' };
    if (status === 'lotada') return { success: false, message: 'Não há vagas disponíveis.' };

    const alreadyRegistered = registrations.some(
      r => r.activity_id === activityId && r.user_id === userId && r.status !== 'cancelada'
    );
    if (alreadyRegistered) return { success: false, message: 'Você já está inscrita nesta atividade.' };

    const newReg: Registration = {
      id: `reg_${Date.now()}`,
      activity_id: activityId,
      user_id: userId,
      status: 'inscrita',
      created_at: new Date().toISOString(),
    };

    setRegistrations(prev => [...prev, newReg]);
    setActivities(prev => prev.map(a =>
      a.id === activityId ? { ...a, available_slots: a.available_slots - 1 } : a
    ));

    return { success: true, message: 'Inscrição realizada com sucesso!' };
  }, [activities, registrations, getEffectiveStatus]);

  const cancelRegistration = useCallback((registrationId: string) => {
    const reg = registrations.find(r => r.id === registrationId);
    if (!reg) return;

    setRegistrations(prev => prev.map(r =>
      r.id === registrationId ? { ...r, status: 'cancelada' as RegistrationStatus } : r
    ));
    setActivities(prev => prev.map(a =>
      a.id === reg.activity_id ? { ...a, available_slots: a.available_slots + 1 } : a
    ));
  }, [registrations]);

  const updateRegistrationStatus = useCallback((registrationId: string, status: RegistrationStatus) => {
    setRegistrations(prev => prev.map(r =>
      r.id === registrationId ? { ...r, status } : r
    ));
  }, []);

  const getUserRegistrations = useCallback((userId: string) => {
    return registrations
      .filter(r => r.user_id === userId && r.status !== 'cancelada')
      .map(r => ({
        ...r,
        activity: activities.find(a => a.id === r.activity_id)!,
      }))
      .filter(r => r.activity);
  }, [registrations, activities]);

  const getActivityRegistrations = useCallback((activityId: string) => {
    return registrations.filter(r => r.activity_id === activityId && r.status !== 'cancelada');
  }, [registrations]);

  const isUserRegistered = useCallback((activityId: string, userId: string) => {
    return registrations.some(
      r => r.activity_id === activityId && r.user_id === userId && r.status !== 'cancelada'
    );
  }, [registrations]);

  return (
    <DataContext.Provider value={{
      activities, registrations, addActivity, updateActivity, deleteActivity,
      registerForActivity, cancelRegistration, updateRegistrationStatus,
      getUserRegistrations, getActivityRegistrations, isUserRegistered, getEffectiveStatus,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
