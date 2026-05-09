import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ServiceOrder, Appointment } from '../types';

// --- Service Orders ---

export async function saveServiceOrder(
  order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'service_orders'), {
    ...order,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateServiceOrder(
  id: string,
  data: Partial<ServiceOrder>
): Promise<void> {
  await updateDoc(doc(db, 'service_orders', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteServiceOrder(id: string): Promise<void> {
  await deleteDoc(doc(db, 'service_orders', id));
}

export async function getServiceOrders(): Promise<ServiceOrder[]> {
  const q = query(collection(db, 'service_orders'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ServiceOrder, 'id'>),
    createdAt: (d.data().createdAt as Timestamp)?.toDate(),
    updatedAt: (d.data().updatedAt as Timestamp)?.toDate(),
  }));
}

// --- Appointments ---

export async function saveAppointment(
  appointment: Omit<Appointment, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'appointments'), {
    ...appointment,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateAppointment(
  id: string,
  data: Partial<Appointment>
): Promise<void> {
  await updateDoc(doc(db, 'appointments', id), data);
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'appointments', id));
}

export async function getAppointments(): Promise<Appointment[]> {
  const q = query(collection(db, 'appointments'), orderBy('appointmentDate', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Appointment, 'id'>),
    createdAt: (d.data().createdAt as Timestamp)?.toDate(),
  }));
}

// --- n8n Webhook ---

export async function triggerN8nWebhook(appointment: Appointment): Promise<boolean> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
  if (!webhookUrl) return false;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'appointment_created',
        timestamp: new Date().toISOString(),
        appointment: {
          id: appointment.id,
          clientName: appointment.clientName,
          phone: appointment.phone,
          email: appointment.email,
          date: appointment.appointmentDate,
          time: appointment.appointmentTime,
          serviceType: appointment.serviceType,
          notes: appointment.notes,
          status: appointment.status,
        },
      }),
    });
    return true;
  } catch {
    return false;
  }
}
