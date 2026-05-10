/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Menu,
  X,
  Droplets,
  Wind,
  WashingMachine,
  Instagram,
  LayoutDashboard,
} from 'lucide-react';

import foto1 from './foto_1.png';
import foto2 from './foto_2.png';
import foto3 from './foto_3.png';
import foto4 from './foto_4.png';
import foto5 from './foto_5.png';
import foto6 from './foto_6.png';
import foto7 from './foto_7.png';
import foto8 from './foto_8.png';
import logo from './logo_sem_fundo.png';

import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="login" element={
          <div className="min-h-screen font-sans text-white selection:bg-gold/20">
            <div className="fixed inset-0 pointer-events-none z-0">
              <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[180px]" />
              <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gold-light/5 rounded-full blur-[150px]" />
            </div>
            <AdminLogin 
              onLogin={() => {
                sessionStorage.setItem('adminAuth', 'true');
                setIsAuthenticated(true);
                navigate('/admin/dashboard');
              }} 
              onBack={() => { window.location.href = '/'; }} 
            />
          </div>
        } />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen font-sans text-white selection:bg-gold/20">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gold-light/5 rounded-full blur-[150px]" />
      </div>
      <AdminPanel onLogout={() => {
        sessionStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        navigate('/admin/login');
      }} />
    </div>
  );
}

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    { url: foto1, label: 'Antes' },
    { url: foto2, label: 'Processo' },
    { url: foto3, label: 'Extração' },
    { url: foto4, label: 'Limpeza' },
    { url: foto5, label: 'Depois' },
    { url: foto6, label: 'Resultado' },
    { url: foto7, label: 'Conforto' },
    { url: foto8, label: 'Finalizado' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  // Landing Page
  return (
    <div className="min-h-screen font-sans text-white selection:bg-gold/20 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gold/8 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gold-light/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="F&E Clean Logo" className="h-14 w-auto object-contain brightness-0 invert" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl tracking-tight leading-none">F&E Clean</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Higienização de Estofados</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-12">
            <a href="#inicio" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-gold transition-colors">Início</a>
            <a href="#servicos" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-gold transition-colors">Serviços</a>
            <a href="#diferenciais" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-gold transition-colors">Diferenciais</a>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-8 py-3 glass-strong text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-gold/10 active:scale-95 flex items-center gap-2"
            >
              <LayoutDashboard size={14} /> Painel Admin
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass bg-midnight/80 border-b border-white/10 px-6 py-8 flex flex-col gap-6 overflow-hidden"
            >
              <a href="#inicio" className="text-sm font-bold uppercase tracking-widest text-white" onClick={() => setIsMenuOpen(false)}>Início</a>
              <a href="#servicos" className="text-sm font-bold uppercase tracking-widest text-white" onClick={() => setIsMenuOpen(false)}>Serviços</a>
              <button
                onClick={() => { navigate('/admin/dashboard'); setIsMenuOpen(false); }}
                className="w-full py-5 bg-gold text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={16} /> Painel Admin
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative pt-48 pb-32 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 z-10"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-10">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Estética Residencial de Alto Padrão</span>
              </div>
              <h1 className="text-7xl md:text-[120px] font-serif font-black leading-[0.85] mb-10 tracking-tighter">
                RENOVE <br />
                <span className="text-white">SEU</span> <br />
                <span className="text-gold italic">CONFORTO.</span>
              </h1>
              <p className="text-xl text-white/50 mb-14 max-w-lg leading-relaxed font-light">
                Uma curadoria técnica em higienização e blindagem de estofados. Transformamos o cuidado em uma experiência única e bem-estar.
              </p>
              <div className="flex flex-wrap gap-8 items-center">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="h-18 px-12 bg-gold text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 active:scale-95 group"
                >
                  <LayoutDashboard size={18} />
                  Acessar Painel
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="https://wa.me/5516920047362"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-gold transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-gold transition-colors">
                    <MessageCircle size={20} />
                  </div>
                  Consultoria via WhatsApp
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-[4/5] rounded-[60px] overflow-hidden shadow-3xl group">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0"
                  >
                    <img
                      src={heroImages[currentImageIndex].url}
                      alt="F&E Clean Showcase"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-midnight/40" />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
                  {heroImages.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-700 ${i === currentImageIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 glass-strong p-8 rounded-[40px] shadow-2xl hidden xl:block z-20">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-white">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Certificação Premium</p>
                    <p className="text-lg font-serif font-bold text-white">Garantia de Cuidado Exclusivo</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Diferenciais */}
      <section id="diferenciais" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">Excelência em Limpeza</span>
            <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter">DIFERENCIAIS <span className="italic text-gold">TÉCNICOS</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[700px]">
            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 md:row-span-2 glass rounded-[48px] p-12 flex flex-col justify-between group overflow-hidden relative">
              <div className="z-10">
                <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center text-gold mb-8"><WashingMachine size={32} /></div>
                <h3 className="text-4xl font-serif font-bold mb-6 text-white">Tecnologia de Extração</h3>
                <p className="text-white/50 leading-relaxed max-w-sm">Utilizamos equipamentos de alta performance que removem sujidades incrustadas e microrganismos, preservando a integridade das fibras.</p>
              </div>
              <img src={foto3} className="absolute -bottom-10 -right-10 w-64 h-64 object-cover rounded-full opacity-10 group-hover:scale-110 transition-transform duration-700" />
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 glass-strong rounded-[48px] p-10 text-white flex items-center gap-8">
              <div className="w-20 h-20 bg-gold rounded-full flex-shrink-0 flex items-center justify-center"><ShieldCheck size={36} /></div>
              <div>
                <h3 className="text-2xl font-serif font-bold mb-2">Blindagem Nanotecnológica</h3>
                <p className="text-white/50 text-sm leading-relaxed">Proteção invisível que repele líquidos e evita manchas sem alterar o toque do tecido.</p>
              </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-gold rounded-[48px] p-10 text-white flex flex-col justify-center text-center">
              <Droplets size={40} className="mx-auto mb-4" />
              <h3 className="text-xl font-serif font-bold mb-2">Eco-Friendly</h3>
              <p className="text-white/80 text-xs">Produtos biodegradáveis e atóxicos.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="glass rounded-[48px] p-10 flex flex-col justify-center text-center">
              <Wind size={40} className="mx-auto mb-4 text-gold-light" />
              <h3 className="text-xl font-serif font-bold mb-2 text-white">Secagem Controlada</h3>
              <p className="text-white/50 text-xs">Processo técnico que otimiza o tempo de secagem, garantindo a preservação das fibras.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicos" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">Nossa Expertise</span>
              <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter uppercase leading-none">SERVIÇOS <br /><span className="text-gold">EXCLUSIVOS</span></h2>
            </div>
            <a
              href="https://wa.me/5516920047362"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold uppercase tracking-widest text-white/70 border-b border-white/30 pb-2 hover:text-gold hover:border-gold transition-all"
            >
              Solicitar Orçamento via WhatsApp
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Higienização', icon: <Droplets size={32} />, desc: 'Tratamento profundo que remove ácaros, fungos e bactérias, devolvendo a pureza ao seu estofado.', style: 'glass' },
              { title: 'Impermeabilização', icon: <ShieldCheck size={32} />, desc: 'Aplicação de polímeros de alta performance que criam uma barreira protetora definitiva.', style: 'glass-strong' },
              { title: 'Revitalização', icon: <Wind size={32} />, desc: 'Processo exclusivo para tecidos nobres como linho e seda, recuperando o brilho e a maciez original.', style: 'bg-gold text-white' },
            ].map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -15 }}
                className={`${service.style} p-14 rounded-[60px] flex flex-col h-[480px] justify-between group cursor-pointer shadow-2xl shadow-gold/5 border border-white/10`}
              >
                <div className={`w-20 h-20 ${service.style === 'bg-gold text-white' ? 'bg-white/20' : 'bg-gold/10'} rounded-[24px] flex items-center justify-center group-hover:scale-110 transition-transform text-gold`}>
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-4xl font-serif font-bold mb-6 tracking-tight text-white">{service.title}</h3>
                  <p className="text-white/50 font-light leading-relaxed text-lg">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">Portfólio</span>
            <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter uppercase">GALERIA DE <span className="text-gold italic">EXCELÊNCIA</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {heroImages.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-square rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer"
              >
                <img src={img.url} alt={`Resultado ${i + 1}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-midnight/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass text-white pt-40 pb-16 px-6 relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-40">
            <div className="md:col-span-6">
              <div className="flex items-center gap-5 mb-14">
                <img src={logo} alt="F&E Clean Logo" className="h-20 w-auto object-contain brightness-0 invert" />
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-3xl tracking-tighter uppercase">F&E Clean</span>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Higienização de Estofados</span>
                </div>
              </div>
              <h3 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-16 leading-[0.9]">
                REFERÊNCIA <br />
                EM <span className="text-gold italic">CUIDADO</span> <br />
                RESIDENCIAL.
              </h3>
              <div className="flex flex-wrap gap-6">
                <a href="https://wa.me/5516920047362" target="_blank" rel="noopener noreferrer"
                  className="h-16 px-10 bg-gold text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 active:scale-95">
                  Agendar Agora <MessageCircle size={20} />
                </a>
                <a href="https://instagram.com/feclean1" target="_blank" rel="noopener noreferrer"
                  className="w-16 h-16 border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-midnight transition-all active:scale-95">
                  <Instagram size={24} />
                </a>
              </div>
            </div>

            <div className="md:col-span-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-10">Explorar</p>
              <ul className="space-y-8">
                <li><a href="#inicio" className="text-lg font-serif hover:text-gold transition-colors">Início</a></li>
                <li><a href="#servicos" className="text-lg font-serif hover:text-gold transition-colors">Serviços</a></li>
                <li><a href="#diferenciais" className="text-lg font-serif hover:text-gold transition-colors">Diferenciais</a></li>
                <li>
                  <button onClick={() => navigate('/admin/dashboard')} className="text-lg font-serif hover:text-gold transition-colors flex items-center gap-2">
                    <LayoutDashboard size={16} /> Painel Admin
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-10">Contato</p>
              <ul className="space-y-8">
                <li className="text-xl font-serif">(16) 920047362</li>
                <li className="text-lg font-serif text-white/40">fe.cleanhigienizacao@gmail.com</li>
                <li className="text-lg font-serif text-white/40">Ribeirão Preto, SP</li>
              </ul>
            </div>
          </div>

          <div className="pt-16 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.4em] text-white/30">
            <p>© 2026 F&E Clean. Excellence in every fiber.</p>
            <div className="flex gap-12">
              <a href="#" className="hover:text-gold transition-colors">Privacidade</a>
              <a href="#" className="hover:text-gold transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
