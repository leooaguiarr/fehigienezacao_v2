import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Filter } from 'lucide-react';
import { deleteServiceOrder, updateServiceOrder } from '../../lib/db';
import type { ServiceOrder, OSStatus } from '../../types';

interface Props {
  orders: ServiceOrder[];
  onRefresh: () => void;
  onNewOS: () => void;
  onEditOS: (os: ServiceOrder) => void;
}

const STATUS_OPTIONS: { value: OSStatus; label: string; cls: string }[] = [
  { value: 'pendente', label: 'Pendente', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { value: 'em_andamento', label: 'Em andamento', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { value: 'concluido', label: 'Concluído', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { value: 'cancelado', label: 'Cancelado', cls: 'bg-red-500/20 text-red-300 border-red-500/30' },
];

function fmtDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

export default function OSList({ orders, onRefresh, onNewOS, onEditOS }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OSStatus | 'all'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    await deleteServiceOrder(id);
    setConfirmDelete(null);
    onRefresh();
  };

  const handleStatusChange = async (id: string, status: OSStatus) => {
    await updateServiceOrder(id, { status });
    setChangingStatus(null);
    onRefresh();
  };

  const statusInfo = (s: OSStatus) => STATUS_OPTIONS.find((o) => o.value === s) ?? STATUS_OPTIONS[0];

  const totalRevenue = filtered.reduce((sum, o) => {
    return sum + (parseFloat(o.price.replace(/\./g, '').replace(',', '.')) || 0);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white">Ordens de Serviço</h2>
          <p className="text-white/40 text-sm mt-1">{filtered.length} Ordens de Serviço encontradas · Receita: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <button
          onClick={onNewOS}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gold-light transition-all shadow-xl shadow-gold/20 active:scale-95"
        >
          <Plus size={16} /> Nova OS
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 flex items-center gap-3 glass border border-white/10 rounded-xl px-4 focus-within:border-gold transition-colors">
          <Search size={16} className="text-white/30" />
          <input
            type="text"
            placeholder="Buscar por cliente ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none py-2.5 text-sm text-white placeholder-white/20"
          />
        </div>
        <div className="flex items-center gap-2 glass border border-white/10 rounded-xl px-4">
          <Filter size={14} className="text-white/30" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OSStatus | 'all')}
            className="bg-transparent outline-none py-2.5 text-sm text-white cursor-pointer"
          >
            <option value="all" className="bg-slate-800">Todos os status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value} className="bg-slate-800">{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <FileText size={40} className="mb-4" />
            <p className="text-base">Nenhuma ordem de serviço encontrada</p>
            <button onClick={onNewOS} className="mt-4 text-gold text-sm font-bold hover:text-gold-light transition-colors">
              + Criar primeira OS
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-white/20 border-b border-white/5">
                  <th className="text-left px-6 py-3">Cliente</th>
                  <th className="text-left px-6 py-3">Telefone</th>
                  <th className="text-left px-6 py-3">Data</th>
                  <th className="text-left px-6 py-3 hidden md:table-cell">Serviço</th>
                  <th className="text-left px-6 py-3">Valor</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-white">{o.clientName || '—'}</td>
                    <td className="px-6 py-4 text-sm text-white/40">{o.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm text-white/50">{fmtDate(o.date)}</td>
                    <td className="px-6 py-4 text-sm text-white/50 hidden md:table-cell">{o.serviceType}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gold">
                      {o.price ? `R$ ${o.price}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {changingStatus === o.id ? (
                        <select
                          autoFocus
                          defaultValue={o.status}
                          onChange={(e) => handleStatusChange(o.id!, e.target.value as OSStatus)}
                          onBlur={() => setChangingStatus(null)}
                          className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 outline-none cursor-pointer border border-white/20"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setChangingStatus(o.id!)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusInfo(o.status).cls} hover:opacity-80 transition-opacity`}
                        >
                          {statusInfo(o.status).label}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditOS(o)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gold/10 text-gold active:bg-gold active:text-white hover:bg-gold hover:text-white transition-all"
                          title="Editar OS"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(o.id!)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 active:bg-red-500 active:text-white hover:bg-red-500 hover:text-white transition-all"
                          title="Excluir OS"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-midnight/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass rounded-2xl p-8 max-w-sm w-full border border-red-500/20 shadow-2xl">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Trash2 size={28} className="text-red-400" />
            </div>
            <h3 className="text-xl font-serif font-bold text-white text-center mb-2">Excluir OS?</h3>
            <p className="text-white/40 text-sm text-center mb-8">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 glass border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-400 transition-all"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
