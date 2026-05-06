export type UserType = 'externo' | 'interno';
export type ActivityType = 'oficina' | 'minicurso' | 'palestra';
export type ActivityStatus = 'aberta' | 'encerrada' | 'cancelada';
export type RegistrationStatus = 'inscrita' | 'confirmada' | 'cancelada' | 'presente';

export interface User {
  id: string;
  name: string;
  email: string;
  user_type: UserType;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  start_date: string;
  end_date: string;
  location: string;
  total_slots: number;
  available_slots: number;
  status: ActivityStatus;
  created_by: string;
}

export interface Registration {
  id: string;
  activity_id: string;
  user_id: string;
  status: RegistrationStatus;
  created_at: string;
}
