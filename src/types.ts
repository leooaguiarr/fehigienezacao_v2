export type ServiceType = 'Higienização' | 'Impermeabilização' | 'Ambos';
export type DirtLevel = 'Leve' | 'Moderado' | 'Intenso';
export type OSStatus = 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
export type AppointmentStatus = 'agendado' | 'confirmado' | 'concluido' | 'cancelado';

export interface ServiceOrder {
  id?: string;
  clientName: string;
  phone: string;
  date: string;
  serviceType: ServiceType;
  fabrics: string[];
  dirtLevel: DirtLevel;
  conditions: string[];
  dirtTypes: string[];
  observations: string;
  price: string;
  status: OSStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Appointment {
  id?: string;
  clientName: string;
  phone: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: ServiceType;
  notes: string;
  status: AppointmentStatus;
  osId?: string;
  n8nTriggered?: boolean;
  createdAt?: Date;
}
