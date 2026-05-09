import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, CalendarDays, DollarSign, FileText, Clock } from 'lucide-react';
import type { ServiceOrder, Appointment } from '../../types';

interface Props {
  orders: ServiceOrder[];
  appointments: Appointment[];
  onTabChange: (tab: string) => void;
}

function parsePrice(p: string): number {
  return parseFloat(p.replace(/\./g, '').replace(',', '.')) || 0;
}

function fmtCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(d: string) {
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pendente: { label: 'Pendente', cls: 'bg-yellow-500/20 text-yellow-300' },
  em_andamento: { label: 'Em andamento', cls: 'bg-blue-500/20 text-blue-300' },
  concluido: { label: 'Concluído', cls: 'bg-emerald-500/20 text-emerald-300' },
  cancelado: { label: 'Cancelado', cls: 'bg-red-500/20 text-red-300' },
};

const APPT_STATUS: Record<string, { label: string; cls: string }> = {
  agendado: { label: 'Agendado', cls: 'bg-blue-500/20 text-blue-300' },
  confirmado: { label: 'Confirmado', cls: 'bg-emerald-500/20 text-emerald-300' },
  concluido: { label: 'Concluído', cls: 'bg-teal-500/20 text-teal-300' },
  cancelado: { label: 'Cancelado', cls: 'bg-red-500/20 text-red-300' },
};

export default function Dashboard({ orders, appointments, onTabChange }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  const totalRevenue = orders.reduce((s, o) => s + parsePrice(o.price), 0);
  const thisMonthRevenue = orders
    .filter((o) => o.date?.startsWith(thisMonth))
    .reduce((s, o) => s + parsePrice(o.price), 0);
  const todayAppointments = appointments.filter((a) => a.appointmentDate === today);
  const completedOrders = orders.filter((o) => o.status === 'concluido').length;

  const recentOrders = orders.slice(0, 6);
  const upcomingAppointments = appointments
    .filter((a) => a.appointmentDate >= today && a.status !== 'cancelado')
    .slice(0, 5);

  // Monthly revenue: last 6 months
  const monthlyData = (() => {
    const result: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      const value = orders.filter((o) => o.date?.startsWith(key)).reduce((s, o) => s + parsePrice(o.price), 0);
      result.push({ label, value });
    }
    return result;
  })();
  const maxMonthly = Math.max(...monthlyData.map((m) => m.value), 1);

  const stats = [
    { icon: <FileText size={22} />, label: 'Total de Ordens de Serviço', value: orders.length.toString(), sub: `${completedOrders} concluídas`, color: 'from-gold/20 to-gold/5' },
    { icon: <DollarSign size={22} />, label: 'Receita Total', value: fmtCurrency(totalRevenue), sub: 'todas as OSes', color: 'from-emerald-500/20 to-emerald-500/5' },
    { icon: <TrendingUp size={22} />, label: 'Este Mês', value: fmtCurrency(thisMonthRevenue), sub: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), color: 'from-blue-500/20 to-blue-500/5' },
    { icon: <CalendarDays size={22} />, label: 'Agendamentos Hoje', value: todayAppointments.length.toString(), sub: `${appointments.filter(a => a.status === 'agendado').length} pendentes`, color: 'from-purple-500/20 to-purple-500/5' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-white mb-1">Dashboard</h2>
        <p className="text-white/40 text-sm">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`glass rounded-2xl p-5 bg-gradient-to-br ${s.color} border border-white/5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gold">
                {s.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{s.label}</span>
            </div>
            <p className="text-2xl font-serif font-bold text-white leading-none mb-1">{s.value}</p>
            <p className="text-xs text-white/30">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-6">Receita Mensal</h3>
          <div className="flex items-end gap-3 h-32">
            {monthlyData.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] text-white/30 font-bold">{fmtCurrency(m.value).replace('R$\xa0', '')}</span>
                <div className="w-full rounded-t-lg bg-gold/20 relative overflow-hidden" style={{ height: `${(m.value / maxMonthly) * 96 + 4}px` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-gold to-gold-light opacity-70" />
                </div>
                <span className="text-[10px] text-white/40 font-bold uppercase">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Próximos Agendamentos</h3>
            <button onClick={() => onTabChange('scheduling')} className="text-[10px] text-gold hover:text-gold-light transition-colors font-bold">Ver todos →</button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-white/20">
              <CalendarDays size={28} className="mb-2" />
              <p className="text-xs">Nenhum agendamento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-9 h-9 rounded-xl bg-gold/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[9px] text-gold font-bold leading-none">{a.appointmentDate.split('-')[2]}</span>
                    <span className="text-[8px] text-white/30 uppercase">{new Date(a.appointmentDate + 'T12:00').toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{a.clientName}</p>
                    <p className="text-xs text-white/30">{a.appointmentTime} · {a.serviceType}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Últimas Ordens de Serviço</h3>
          <button onClick={() => onTabChange('os-list')} className="text-[10px] text-gold hover:text-gold-light transition-colors font-bold">Ver todas →</button>
        </div>
        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/20">
            <FileText size={32} className="mb-3" />
            <p className="text-sm">Nenhuma OS cadastrada ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                  <th className="text-left px-6 py-3">Cliente</th>
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Serviço</th>
                  <th className="text-left px-6 py-3">Valor</th>
                  <th className="text-left px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-white">{o.clientName || '—'}</td>
                    <td className="px-6 py-3 text-sm text-white/50">{fmtDate(o.date)}</td>
                    <td className="px-6 py-3 text-sm text-white/50 hidden md:table-cell">{o.serviceType}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gold">
                      {o.price ? `R$ ${o.price}` : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${STATUS_LABEL[o.status]?.cls || 'bg-white/10 text-white/40'}`}>
                        {STATUS_LABEL[o.status]?.label || o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
