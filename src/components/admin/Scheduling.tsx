import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Trash2, CheckCircle, Clock, XCircle, Calendar, AlertCircle, Zap, Edit } from 'lucide-react';
import { saveAppointment, updateAppointment, deleteAppointment, triggerN8nWebhook } from '../../lib/db';
import type { Appointment, AppointmentStatus, ServiceType } from '../../types';

interface Props {
  appointments: Appointment[];
  onRefresh: () => void;
}

const EMPTY_APPT = (): Omit<Appointment, 'id' | 'createdAt'> => ({
  clientName: '',
  phone: '',
  email: '',
  appointmentDate: new Date().toISOString().split('T')[0],
  appointmentTime: '09:00',
  serviceType: 'Higienização',
  notes: '',
  status: 'agendado',
});

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  agendado: { label: 'Agendado', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: <Clock size={12} /> },
  confirmado: { label: 'Confirmado', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: <CheckCircle size={12} /> },
  concluido: { label: 'Concluído', cls: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: <CheckCircle size={12} /> },
  cancelado: { label: 'Cancelado', cls: 'bg-red-500/20 text-red-300 border-red-500/30', icon: <XCircle size={12} /> },
};

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Scheduling({ appointments, onRefresh }: Props) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAppt, setEditAppt] = useState<Appointment | null>(null);
  const [form, setForm] = useState(EMPTY_APPT());
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const hasN8n = !!import.meta.env.VITE_N8N_WEBHOOK_URL;

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const apptsByDate = appointments.reduce<Record<string, Appointment[]>>((acc, a) => {
    acc[a.appointmentDate] = [...(acc[a.appointmentDate] || []), a];
    return acc;
  }, {});

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);
  const todayStr = today.toISOString().split('T')[0];

  const openNew = (date?: string) => {
    setEditAppt(null);
    setForm({ ...EMPTY_APPT(), appointmentDate: date || new Date().toISOString().split('T')[0] });
    setShowModal(true);
    setN8nStatus('idle');
  };

  const openEdit = (appt: Appointment) => {
    setEditAppt(appt);
    setForm({
      clientName: appt.clientName,
      phone: appt.phone,
      email: appt.email,
      appointmentDate: appt.appointmentDate,
      appointmentTime: appt.appointmentTime,
      serviceType: appt.serviceType,
      notes: appt.notes,
      status: appt.status,
    });
    setShowModal(true);
    setN8nStatus('idle');
  };

  const handleSave = async () => {
    if (!form.clientName || !form.appointmentDate || !form.appointmentTime) {
      return alert('Preencha nome, data e horário.');
    }
    setSaving(true);
    try {
      if (editAppt?.id) {
        await updateAppointment(editAppt.id, form);
        setShowModal(false);
        onRefresh();
      } else {
        const id = await saveAppointment(form);
        const newAppt = { ...form, id };
        const triggered = await triggerN8nWebhook(newAppt);
        setN8nStatus(hasN8n ? (triggered ? 'success' : 'fail') : 'idle');
        if (triggered) await updateAppointment(id, { n8nTriggered: true });
        setShowModal(false);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar agendamento.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    await updateAppointment(id, { status });
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
    setConfirmDelete(null);
    onRefresh();
  };

  const selectedAppts = selectedDate ? (apptsByDate[selectedDate] || []) : [];

  const upcomingAppts = appointments
    .filter(a => a.appointmentDate >= todayStr && a.status !== 'cancelado')
    .sort((a, b) => `${a.appointmentDate}${a.appointmentTime}`.localeCompare(`${b.appointmentDate}${b.appointmentTime}`));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Agendamentos</h2>
          <p className="text-white/40 text-sm mt-1">{appointments.filter(a => a.status === 'agendado').length} pendentes · {appointments.filter(a => a.status === 'confirmado').length} confirmados</p>
        </div>
        <button onClick={() => openNew()} className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold-light transition-all shadow-xl shadow-gold/20 active:scale-95">
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

      {/* n8n Banner */}
      {!hasN8n && (
        <div className="flex items-start gap-4 glass rounded-xl p-4 border border-yellow-500/20 bg-yellow-500/5">
          <Zap size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-yellow-300">Integração n8n não configurada</p>
            <p className="text-xs text-white/40 mt-1">
              Adicione <code className="text-yellow-300 bg-white/10 px-1 rounded">VITE_N8N_WEBHOOK_URL</code> no arquivo <code className="text-yellow-300 bg-white/10 px-1 rounded">.env</code> para automatizar WhatsApp, email e Google Calendar nos agendamentos.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-base font-bold text-white">
              {monthNames[calMonth]} {calYear}
            </h3>
            <button onClick={nextMonth} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-3">
            {weekDays.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-white/20 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayAppts = apptsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const isPast = dateStr < todayStr;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm font-medium transition-all
                    ${isSelected ? 'bg-gold text-white' : isToday ? 'bg-gold/20 text-gold ring-1 ring-gold/50' : isPast ? 'text-white/20 hover:bg-white/5' : 'text-white/70 hover:bg-white/10'}`}
                >
                  <span className="text-xs">{day}</span>
                  {dayAppts.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayAppts.slice(0, 3).map((_, ii) => (
                        <span key={ii} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-gold'}`} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day appointments */}
          {selectedDate && (
            <div className="mt-6 border-t border-white/5 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">
                  {new Date(selectedDate + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h4>
                <button onClick={() => openNew(selectedDate)} className="text-xs text-gold font-bold hover:text-gold-light transition-colors flex items-center gap-1">
                  <Plus size={12} /> Novo
                </button>
              </div>
              {selectedAppts.length === 0 ? (
                <p className="text-white/20 text-sm text-center py-4">Nenhum agendamento neste dia</p>
              ) : (
                <div className="space-y-2">
                  {selectedAppts.map(a => (
                    <div key={a.id} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-gold flex-shrink-0">{a.appointmentTime}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{a.clientName}</p>
                          <p className="text-xs text-white/30">{a.serviceType} · {a.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${STATUS_CONFIG[a.status].cls}`}>
                          {STATUS_CONFIG[a.status].icon} {STATUS_CONFIG[a.status].label}
                        </span>
                        <button onClick={() => openEdit(a)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gold/10 text-gold active:bg-gold active:text-white transition-all">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => setConfirmDelete(a.id!)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 active:bg-red-500 active:text-white transition-all">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming list */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Próximos</h3>
          {upcomingAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-white/20">
              <Calendar size={32} className="mb-3" />
              <p className="text-xs">Nenhum agendamento futuro</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {upcomingAppts.map(a => (
                <div key={a.id} className="rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{a.clientName}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {new Date(a.appointmentDate + 'T12:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} às {a.appointmentTime}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">{a.serviceType}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${STATUS_CONFIG[a.status].cls}`}>
                        {STATUS_CONFIG[a.status].label}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {a.status === 'agendado' && (
                          <button onClick={() => handleStatusChange(a.id!, 'confirmado')} className="text-[9px] text-emerald-400 font-bold hover:text-emerald-300 transition-colors">Confirmar</button>
                        )}
                        {(a.status === 'agendado' || a.status === 'confirmado') && (
                          <button onClick={() => handleStatusChange(a.id!, 'concluido')} className="text-[9px] text-teal-400 font-bold hover:text-teal-300 transition-colors ml-1">Concluir</button>
                        )}
                      </div>
                    </div>
                  </div>
                  {a.notes && <p className="text-xs text-white/20 mt-2 border-t border-white/5 pt-2 truncate">{a.notes}</p>}
                  {a.n8nTriggered && (
                    <div className="flex items-center gap-1 mt-1">
                      <Zap size={10} className="text-yellow-400" />
                      <span className="text-[9px] text-yellow-400/60">n8n ativado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="glass rounded-2xl p-8 max-w-lg w-full border border-white/10 shadow-2xl my-auto">
            <h3 className="text-xl font-serif font-bold text-white mb-6">
              {editAppt ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Nome do Cliente *</label>
                  <input type="text" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                    className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-transparent outline-none focus:border-gold transition-colors placeholder-white/20"
                    placeholder="Nome completo" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Telefone</label>
                  <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-transparent outline-none focus:border-gold transition-colors placeholder-white/20"
                    placeholder="(16) 99999-9999" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-transparent outline-none focus:border-gold transition-colors placeholder-white/20"
                    placeholder="email@exemplo.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Data *</label>
                  <input type="date" value={form.appointmentDate} onChange={e => setForm(p => ({ ...p, appointmentDate: e.target.value }))}
                    className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-transparent outline-none focus:border-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Horário *</label>
                  <input type="time" value={form.appointmentTime} onChange={e => setForm(p => ({ ...p, appointmentTime: e.target.value }))}
                    className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-transparent outline-none focus:border-gold transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Tipo de Serviço</label>
                  <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value as ServiceType }))}
                    className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-slate-800 outline-none focus:border-gold transition-colors cursor-pointer">
                    <option value="Higienização">Higienização Técnica</option>
                    <option value="Impermeabilização">Blindagem Nanotecnológica</option>
                    <option value="Ambos">Higienização + Blindagem</option>
                  </select>
                </div>
                {editAppt && (
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as AppointmentStatus }))}
                      className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-slate-800 outline-none focus:border-gold transition-colors cursor-pointer">
                      <option value="agendado">Agendado</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="concluido">Concluído</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Observações</label>
                  <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
                    className="w-full glass-strong border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white bg-transparent outline-none focus:border-gold transition-colors resize-none placeholder-white/20"
                    placeholder="Detalhes do agendamento..." />
                </div>
              </div>

              {!editAppt && hasN8n && (
                <div className="flex items-center gap-2 py-3 border-t border-white/5">
                  <Zap size={14} className="text-yellow-400" />
                  <p className="text-xs text-white/40">Ao salvar, n8n será acionado para WhatsApp, email e Google Calendar.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 glass border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/5 transition-all">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-gold text-white rounded-xl text-sm font-bold hover:bg-gold-light transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : null}
                {saving ? 'Salvando...' : editAppt ? 'Atualizar' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass rounded-2xl p-8 max-w-sm w-full border border-red-500/20 shadow-2xl">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} className="text-red-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white text-center mb-2">Excluir Agendamento?</h3>
            <p className="text-white/40 text-sm text-center mb-8">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 glass border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/5 transition-all">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-400 transition-all">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
