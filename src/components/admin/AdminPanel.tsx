import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, CalendarDays, LogOut, Menu, X, AlertCircle } from 'lucide-react';
import { getServiceOrders, getAppointments } from '../../lib/db';
import type { ServiceOrder, Appointment } from '../../types';
import Dashboard from './Dashboard';
import OSList from './OSList';
import Scheduling from './Scheduling';
import OSGenerator from '../OSGenerator';
import logo from '../../logo_sem_fundo.png';

type AdminTab = 'dashboard' | 'ordens' | 'nova-os' | 'agendamentos';

interface Props {
  onLogout: () => void;
}

const NAV_ITEMS: { tab: AdminTab; icon: React.ReactNode; label: string }[] = [
  { tab: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { tab: 'ordens', icon: <FileText size={18} />, label: 'Ordens de Serviço' },
  { tab: 'nova-os', icon: <Plus size={18} />, label: 'Nova OS' },
  { tab: 'agendamentos', icon: <CalendarDays size={18} />, label: 'Agendamentos' },
];

export default function AdminPanel({ onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() as AdminTab || 'dashboard';
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOS, setEditOS] = useState<ServiceOrder | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [os, appts] = await Promise.all([getServiceOrders(), getAppointments()]);
      setOrders(os);
      setAppointments(appts);
    } catch (e: any) {
      console.error(e);
      setError('Erro ao conectar com o Firebase. Verifique suas variáveis de ambiente no .env');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleEditOS = (os: ServiceOrder) => {
    setEditOS(os);
    navigate('/admin/nova-os');
    setSidebarOpen(false);
  };

  const handleNewOS = () => {
    setEditOS(undefined);
    navigate('/admin/nova-os');
    setSidebarOpen(false);
  };

  const handleOSSaved = () => {
    // Atualiza os dados em segundo plano sem a tela de loading 
    // para evitar que o OSGenerator seja desmontado e o formulário limpo
    Promise.all([getServiceOrders(), getAppointments()])
      .then(([osList, appts]) => {
        setOrders(osList);
        setAppointments(appts);
      })
      .catch(console.error);
  };

  const switchTab = (t: AdminTab) => {
    if (t !== 'nova-os') setEditOS(undefined);
    navigate(`/admin/${t}`);
    setSidebarOpen(false);
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64 hidden lg:flex'} flex-col glass border-r border-white/10 h-screen sticky top-0`}>
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <img src={logo} alt="F&E Clean" className="h-10 w-auto brightness-0 invert" />
        <div>
          <p className="text-sm font-serif font-bold text-white leading-none">F&E Clean</p>
          <p className="text-[9px] uppercase tracking-widest text-gold font-bold mt-0.5">Painel Admin</p>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ tab: t, icon, label }) => (
          <Link
            key={t}
            to={`/admin/${t}`}
            onClick={() => {
              if (t !== 'nova-os') setEditOS(undefined);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left
              ${currentTab === t ? 'bg-gold text-white shadow-lg shadow-gold/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          >
            {icon} {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} /> Sair do Painel
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex relative">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-midnight/80 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-50" onClick={e => e.stopPropagation()}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 glass border-b border-white/10 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="F&E Clean" className="h-8 w-auto brightness-0 invert" />
            <span className="text-sm font-serif font-bold text-white">Admin</span>
          </div>
          <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-500/10 transition-colors text-white/40 hover:text-red-400">
            <LogOut size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4 text-white/40">
                <span className="animate-spin rounded-full h-10 w-10 border-2 border-gold border-t-transparent" />
                <p className="text-sm">Carregando dados...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 max-w-lg mx-auto mt-12">
              <div className="glass rounded-2xl p-8 border border-red-500/20 text-center">
                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={28} className="text-red-400" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">Erro de Conexão</h3>
                <p className="text-white/40 text-sm mb-6">{error}</p>
                <div className="text-left bg-black/30 rounded-xl p-4 mb-6">
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest mb-2">Passos para configurar:</p>
                  <ol className="text-xs text-white/50 space-y-1.5 list-decimal list-inside">
                    <li>Copie <code className="text-gold">.env.example</code> para <code className="text-gold">.env</code></li>
                    <li>Acesse o <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-gold underline">Firebase Console</a></li>
                    <li>No projeto <strong className="text-white">fehizienizacao</strong>, ative o Firestore</li>
                    <li>Vá em Configurações do Projeto → Seus apps → Copie as credenciais</li>
                    <li>Cole as credenciais no arquivo <code className="text-gold">.env</code></li>
                    <li>Reinicie o servidor com <code className="text-gold">npm run dev</code></li>
                  </ol>
                </div>
                <button onClick={loadData} className="px-6 py-2.5 bg-gold text-white rounded-xl text-sm font-bold hover:bg-gold-light transition-all">
                  Tentar Novamente
                </button>
              </div>
            </div>
          ) : (
            <Routes>
              <Route path="dashboard" element={<Dashboard orders={orders} appointments={appointments} onTabChange={switchTab} />} />
              <Route path="ordens" element={
                <OSList
                  orders={orders}
                  onRefresh={loadData}
                  onNewOS={handleNewOS}
                  onEditOS={handleEditOS}
                />
              } />
              <Route path="nova-os" element={
                <div className="p-4 sm:p-6">
                  <OSGenerator
                    editData={editOS}
                    onSaved={handleOSSaved}
                    onBack={() => switchTab(editOS ? 'ordens' : 'dashboard')}
                  />
                </div>
              } />
              <Route path="agendamentos" element={<Scheduling appointments={appointments} onRefresh={loadData} />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
}
