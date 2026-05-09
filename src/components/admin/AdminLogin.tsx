import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logo from '../../logo_sem_fundo.png';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'feclean2024';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[200px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm z-10"
      >
        <div className="glass rounded-[32px] p-10 shadow-2xl border border-white/10">
          <div className="flex flex-col items-center mb-10">
            <img src={logo} alt="F&E Clean" className="h-16 w-auto brightness-0 invert mb-6" />
            <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={28} className="text-gold" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Área Administrativa</h1>
            <p className="text-white/40 text-sm mt-2">F&E Clean — Acesso restrito</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                Senha de Acesso
              </label>
              <div className="flex items-center gap-3 glass-strong border border-white/10 rounded-xl px-4 focus-within:border-gold transition-colors">
                <Lock size={16} className="text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="flex-1 bg-transparent outline-none py-3 text-white placeholder-white/20 text-sm"
                  placeholder="Digite a senha..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gold text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold-light transition-all shadow-xl shadow-gold/20 active:scale-95"
            >
              Entrar no Painel
            </button>
          </form>

          <button
            onClick={onBack}
            className="w-full mt-4 py-3 text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
          >
            ← Voltar ao site
          </button>
        </div>
      </motion.div>
    </div>
  );
}
