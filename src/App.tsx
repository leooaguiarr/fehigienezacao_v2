/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCheck, 
  User, 
  Phone, 
  Instagram,
  Calendar, 
  WashingMachine, 
  Info, 
  Download, 
  Eraser,
  Droplets,
  Wind,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import local images
import foto1 from './foto_1.png';
import foto2 from './foto_2.png';
import foto3 from './foto_3.png';
import foto4 from './foto_4.png';
import foto5 from './foto_5.png';
import foto6 from './foto_6.png';
import foto7 from './foto_7.png';
import foto8 from './foto_8.png';
import logo from './logo_sem_fundo.png';

// --- Types ---
type ServiceType = 'Higienização' | 'Impermeabilização' | 'Ambos';
type DirtLevel = 'Leve' | 'Moderado' | 'Intenso';

interface ServiceOrder {
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
}

// --- Constants ---
const FABRIC_OPTIONS = ['Suede', 'Linho', 'Chenille', 'Algodão', 'Tecido Sintético'];
const CONDITION_OPTIONS = ['Novo', 'Manchado', 'Desbotado', 'Com Rasgos', 'Amassado', 'Com Odor'];
const DIRT_TYPE_OPTIONS = ['Mofo', 'Molho', 'Poeira', 'Terra', 'Outros'];

export default function App() {
  const [view, setView] = useState<'landing' | 'generator'>('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceOrder>({
    clientName: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    serviceType: 'Higienização',
    fabrics: [],
    dirtLevel: 'Moderado',
    conditions: [],
    dirtTypes: [],
    observations: '',
    price: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    { url: foto1, label: "Antes" },
    { url: foto2, label: "Processo" },
    { url: foto3, label: "Extração" },
    { url: foto4, label: "Limpeza" },
    { url: foto5, label: "Depois" },
    { url: foto6, label: "Resultado" },
    { url: foto7, label: "Conforto" },
    { url: foto8, label: "Finalizado" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const formRef = useRef<HTMLDivElement>(null);
  const clientSigRef = useRef<SignatureCanvas>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (name: keyof ServiceOrder, item: string) => {
    setFormData(prev => {
      const current = prev[name] as string[];
      if (current.includes(item)) {
        return { ...prev, [name]: current.filter(i => i !== item) };
      }
      return { ...prev, [name]: [...current, item] };
    });
  };

  const clearSignatures = () => {
    clientSigRef.current?.clear();
  };

  const generatePDF = async () => {
    if (!formRef.current) return;
    setIsGenerating(true);

    try {
      const element = formRef.current;
      
      // Forçamos uma largura fixa para a captura para garantir layout de desktop no mobile
      const captureWidth = 800;
      const originalWidth = element.style.width;
      element.style.width = `${captureWidth}px`;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: captureWidth,
        windowWidth: captureWidth,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('pdf-content');
          if (clonedElement) {
            clonedElement.style.width = `${captureWidth}px`;
            clonedElement.style.height = 'auto';
            
            // Inject styles for PDF
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;700&family=Dancing+Script&display=swap');
              
              :root {
                --color-midnight: #0a0f1a;
                --color-gold: #c5a059;
                --color-gold-light: #d4b982;
                --color-cool-grey: #f8fafc;
                --color-warm-grey: #f5f2ed;
              }

              #pdf-content {
                font-family: 'Inter', sans-serif !important;
                color: var(--color-midnight) !important;
                background: white !important;
                box-shadow: none !important;
                width: ${captureWidth}px !important;
              }

              .font-serif {
                font-family: 'Playfair Display', serif !important;
              }

              .font-signature {
                font-family: 'Dancing Script', cursive !important;
                color: var(--color-midnight) !important;
              }

              .bg-midnight { background-color: var(--color-midnight) !important; color: white !important; }
              .bg-gold { background-color: var(--color-gold) !important; color: white !important; }
              .bg-warm-grey { background-color: var(--color-warm-grey) !important; }
              .text-gold { color: var(--color-gold) !important; }
              .text-midnight { color: var(--color-midnight) !important; }
              .border-gold { border-color: var(--color-gold) !important; }
              
              input, textarea, select {
                border-color: #e2e8f0 !important;
                color: var(--color-midnight) !important;
                background: transparent !important;
              }

              .no-print { display: none !important; }
              * { box-shadow: none !important; text-shadow: none !important; }
              
              svg path, svg circle {
                stroke: var(--color-gold) !important;
              }
              .bg-midnight svg path, .bg-midnight svg circle {
                stroke: var(--color-gold) !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        }
      });
      
      // Restaura a largura original
      element.style.width = originalWidth;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Adiciona a primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Adiciona páginas subsequentes se o conteúdo for maior que uma página
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`OS_FE_Clean_${formData.clientName.replace(/\s+/g, '_') || 'Sem_Nome'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-cool-grey font-sans text-midnight selection:bg-gold/20">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={logo} 
                alt="F&E Clean Logo" 
                className="h-14 w-auto object-contain brightness-0"
              />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-2xl tracking-tight leading-none">F&E Clean</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Higienização de Estofados</span>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-12">
              <a href="#inicio" className="text-xs font-bold uppercase tracking-widest text-midnight/60 hover:text-gold transition-colors">Início</a>
              <a href="#servicos" className="text-xs font-bold uppercase tracking-widest text-midnight/60 hover:text-gold transition-colors">Serviços</a>
              <a href="#diferenciais" className="text-xs font-bold uppercase tracking-widest text-midnight/60 hover:text-gold transition-colors">Diferenciais</a>
              <button 
                onClick={() => setView('generator')}
                className="px-8 py-3 bg-midnight text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-midnight/10 active:scale-95"
              >
                Gerador de OS
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-midnight" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
                className="md:hidden bg-white border-b border-slate-100 px-6 py-8 flex flex-col gap-6 overflow-hidden"
              >
                <a href="#inicio" className="text-sm font-bold uppercase tracking-widest text-midnight" onClick={() => setIsMenuOpen(false)}>Início</a>
                <a href="#servicos" className="text-sm font-bold uppercase tracking-widest text-midnight" onClick={() => setIsMenuOpen(false)}>Serviços</a>
                <button 
                  onClick={() => { setView('generator'); setIsMenuOpen(false); }}
                  className="w-full py-5 bg-midnight text-white rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  Gerador de OS
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <section id="inicio" className="relative pt-48 pb-32 px-6">
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
                  <span className="text-midnight">SEU</span> <br />
                  <span className="text-gold italic">CONFORTO.</span>
                </h1>
                <p className="text-xl text-slate-500 mb-14 max-w-lg leading-relaxed font-light">
                  Uma curadoria técnica em higienização e blindagem de estofados. Transformamos o cuidado em uma experiência única e bem-estar.
                </p>
                <div className="flex flex-wrap gap-8 items-center">
                  <button 
                    onClick={() => setView('generator')}
                    className="h-18 px-12 bg-midnight text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-gold transition-all shadow-2xl shadow-midnight/20 active:scale-95 group"
                  >
                    Gerar Ordem de Serviço
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a 
                    href="https://wa.me/5516920047362" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-midnight hover:text-gold transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-full border border-midnight/10 flex items-center justify-center group-hover:border-gold transition-colors">
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

                  {/* Progress Indicators */}
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
                    {heroImages.map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 rounded-full transition-all duration-700 ${
                          i === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Floating Glass Badge */}
                <div className="absolute -bottom-10 -left-10 bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50 hidden xl:block z-20">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-white">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Certificação Premium</p>
                      <p className="text-lg font-serif font-bold text-midnight">Garantia de Cuidado Exclusivo</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Diferenciais Técnicos */}
        <section id="diferenciais" className="py-32 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">The Gold Standard</span>
              <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter">DIFERENCIAIS <span className="italic text-gold">TÉCNICOS</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[700px]">
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 md:row-span-2 bg-warm-grey rounded-[48px] p-12 flex flex-col justify-between border border-midnight/5 group overflow-hidden relative"
              >
                <div className="z-10">
                  <div className="w-16 h-16 bg-midnight rounded-2xl flex items-center justify-center text-white mb-8">
                    <WashingMachine size={32} />
                  </div>
                  <h3 className="text-4xl font-serif font-bold mb-6">Tecnologia de Extração</h3>
                  <p className="text-slate-500 leading-relaxed max-w-sm">Utilizamos equipamentos de alta performance que removem sujidades incrustadas e microrganismos, preservando a integridade das fibras.</p>
                </div>
                <img src={foto3} className="absolute -bottom-10 -right-10 w-64 h-64 object-cover rounded-full opacity-20 group-hover:scale-110 transition-transform duration-700" />
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 bg-midnight rounded-[48px] p-10 text-white flex items-center gap-8 border border-white/10"
              >
                <div className="w-20 h-20 bg-gold rounded-full flex-shrink-0 flex items-center justify-center">
                  <ShieldCheck size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Blindagem Nanotecnológica</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Proteção invisível que repele líquidos e evita manchas sem alterar o toque do tecido.</p>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-gold rounded-[48px] p-10 text-white flex flex-col justify-center text-center"
              >
                <Droplets size={40} className="mx-auto mb-4" />
                <h3 className="text-xl font-serif font-bold mb-2">Eco-Friendly</h3>
                <p className="text-white/80 text-xs">Produtos biodegradáveis e atóxicos.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-cool-grey rounded-[48px] p-10 flex flex-col justify-center text-center border border-midnight/5"
              >
                <Wind size={40} className="mx-auto mb-4 text-midnight" />
                <h3 className="text-xl font-serif font-bold mb-2 text-midnight">Secagem Controlada</h3>
                <p className="text-slate-500 text-xs">Processo técnico que otimiza o tempo de secagem, garantindo a preservação das fibras.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-32 bg-cool-grey px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-4 block">Nossa Expertise</span>
                <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter uppercase leading-none">SERVIÇOS <br /><span className="text-gold">EXCLUSIVOS</span></h2>
              </div>
              <button 
                onClick={() => setView('generator')}
                className="text-xs font-bold uppercase tracking-widest text-midnight border-b border-midnight pb-2 hover:text-gold hover:border-gold transition-all"
              >
                Solicitar Orçamento Personalizado
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Higienização', icon: <Droplets size={32} />, desc: 'Tratamento profundo que remove ácaros, fungos e bactérias, devolvendo a pureza ao seu estofado.', color: 'bg-white' },
                { title: 'Impermeabilização', icon: <ShieldCheck size={32} />, desc: 'Aplicação de polímeros de alta performance que criam uma barreira protetora definitiva.', color: 'bg-midnight text-white' },
                { title: 'Revitalização', icon: <Wind size={32} />, desc: 'Processo exclusivo para tecidos nobres como linho e seda, recuperando o brilho e a maciez original.', color: 'bg-gold text-white' }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -15 }}
                  className={`${service.color} p-14 rounded-[60px] flex flex-col h-[480px] justify-between group cursor-pointer shadow-2xl shadow-midnight/5 border border-midnight/5`}
                >
                  <div className={`w-20 h-20 ${service.color === 'bg-white' ? 'bg-cool-grey' : 'bg-white/10'} rounded-[24px] flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-4xl font-serif font-bold mb-6 tracking-tight">{service.title}</h3>
                    <p className={`${service.color === 'bg-white' ? 'text-slate-500' : 'text-white/70'} font-light leading-relaxed text-lg`}>{service.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Results Gallery Section */}
        <section className="py-32 bg-white px-6">
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
                  <img 
                    src={img.url} 
                    alt={`Resultado ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-midnight/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-midnight text-white pt-40 pb-16 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-20 mb-40">
              <div className="md:col-span-6">
                <div className="flex items-center gap-5 mb-14">
                  <img 
                    src={logo} 
                    alt="F&E Clean Logo" 
                    className="h-20 w-auto object-contain brightness-0 invert"
                  />
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-3xl tracking-tighter uppercase">F&E Clean</span>
                    <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Higienização de Estofados</span>
                  </div>
                </div>
                <h3 className="text-5xl md:text-7xl font-serif font-black tracking-tighter mb-16 leading-[0.9]">
                  O PADRÃO OURO <br />
                  EM <span className="text-gold italic">CUIDADO</span> <br />
                  RESIDENCIAL.
                </h3>
                <div className="flex flex-wrap gap-6">
                  <a 
                    href="https://wa.me/5516920047362" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-16 px-10 bg-gold text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-gold-light transition-all shadow-2xl shadow-gold/20 active:scale-95"
                  >
                    Agendar Agora
                    <MessageCircle size={20} />
                  </a>
                  <a 
                    href="https://instagram.com/feclean1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-16 h-16 border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-midnight transition-all active:scale-95"
                  >
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
                  <li><button onClick={() => setView('generator')} className="text-lg font-serif hover:text-gold transition-colors">Gerador de OS</button></li>
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

  return (
    <div className="min-h-screen bg-cool-grey py-12 px-4 sm:px-6 lg:px-8 font-sans text-midnight">
      <div className="max-w-5xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-10 no-print">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('landing')}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:bg-gold hover:text-white transition-all active:scale-95"
              title="Voltar para o site"
            >
              <ArrowRight className="rotate-180" size={20} />
            </button>
            <h1 className="text-3xl font-serif font-bold text-midnight flex items-center gap-3">
              <ClipboardCheck className="text-gold" size={32} />
              Gerador de Ordem de Serviço
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={clearSignatures}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-midnight/10 rounded-full text-midnight/60 hover:text-midnight hover:border-midnight transition-all shadow-sm text-xs font-bold uppercase tracking-widest"
            >
              <Eraser size={16} />
              Limpar
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 bg-midnight text-white rounded-full hover:bg-gold transition-all shadow-xl shadow-midnight/10 disabled:opacity-50 text-xs font-bold uppercase tracking-widest"
            >
              {isGenerating ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Download size={16} />
              )}
              {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>

        {/* The OS Document */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          ref={formRef}
          id="pdf-content"
          className="bg-white shadow-3xl rounded-[40px] overflow-hidden border border-midnight/5 relative"
          style={{ minHeight: '1120px' }}
        >
          {/* Logo Section */}
          <div className="p-12 text-center bg-midnight text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-col items-center justify-center mb-8 relative z-10">
              <img 
                src={logo} 
                alt="F&E Clean Logo" 
                className="h-32 w-auto object-contain brightness-0 invert"
              />
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-serif font-bold mt-4 tracking-[0.2em] uppercase">
                Ordem de Serviço
              </h3>
              <p className="text-gold text-xs font-bold uppercase tracking-[0.4em] mt-4 opacity-80">Higienização de Estofados</p>
            </div>
          </div>

          <div className="p-12 space-y-12">
            {/* Section: Cliente */}
            <section>
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-midnight uppercase mb-8 border-l-4 border-gold pl-4">
                <User size={24} className="text-gold" /> Identificação do Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="w-full border-b border-slate-200 focus:border-gold outline-none py-3 text-xl font-serif font-medium transition-colors bg-transparent"
                    placeholder="Ex: Sr. João Silva"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contato</label>
                  <div className="flex items-center gap-3 border-b border-slate-200 focus-within:border-gold transition-colors">
                    <Phone size={18} className="text-slate-300" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full outline-none py-3 text-xl font-serif font-medium bg-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Data do Serviço</label>
                  <div className="flex items-center gap-3 border-b border-slate-200 focus-within:border-gold transition-colors">
                    <Calendar size={18} className="text-slate-300" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full outline-none py-3 text-xl font-serif font-medium bg-transparent"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Modalidade de Serviço</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full border-b border-slate-200 focus:border-gold outline-none py-3 text-xl font-serif font-medium bg-transparent cursor-pointer"
                  >
                    <option value="Higienização">Higienização Técnica</option>
                    <option value="Impermeabilização">Blindagem Nanotecnológica</option>
                    <option value="Ambos">Higienização + Blindagem</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section: Análise Técnica */}
            <section className="bg-warm-grey/50 p-10 rounded-[40px] border border-midnight/5">
              <h4 className="flex items-center gap-3 text-xl font-serif font-bold text-midnight uppercase mb-10 border-l-4 border-gold pl-4">
                <Info size={24} className="text-gold" /> Laudo Técnico Preliminar
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Tipo de Superfície */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Composição Têxtil</label>
                  <div className="grid grid-cols-2 gap-4">
                    {FABRIC_OPTIONS.map(fabric => (
                      <label key={fabric} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.fabrics.includes(fabric) ? 'border-gold bg-gold' : 'border-slate-300 bg-white'}`}>
                          {formData.fabrics.includes(fabric) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.fabrics.includes(fabric)}
                          onChange={() => toggleArrayItem('fabrics', fabric)}
                          className="hidden"
                        />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-gold transition-colors">{fabric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Grau de Sujidade */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">Nível de Contaminação</label>
                  <div className="relative pt-4 pb-4">
                    <div className="flex h-10 w-full rounded-full overflow-hidden border border-slate-200 bg-white p-1">
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, dirtLevel: 'Leve' }))}
                        className={`flex-1 rounded-full transition-all ${formData.dirtLevel === 'Leve' ? 'bg-gold/20 text-gold' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Leve</span>
                      </button>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, dirtLevel: 'Moderado' }))}
                        className={`flex-1 rounded-full transition-all ${formData.dirtLevel === 'Moderado' ? 'bg-gold text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Moderado</span>
                      </button>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, dirtLevel: 'Intenso' }))}
                        className={`flex-1 rounded-full transition-all ${formData.dirtLevel === 'Intenso' ? 'bg-midnight text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">Intenso</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Situação do Estofado */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Condição Estrutural</label>
                  <div className="grid grid-cols-2 gap-4">
                    {CONDITION_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.conditions.includes(opt) ? 'border-gold bg-gold' : 'border-slate-300 bg-white'}`}>
                          {formData.conditions.includes(opt) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.conditions.includes(opt)}
                          onChange={() => toggleArrayItem('conditions', opt)}
                          className="hidden"
                        />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-gold transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tipo de Sujeira */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Agentes Contaminantes</label>
                  <div className="grid grid-cols-2 gap-4">
                    {DIRT_TYPE_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.dirtTypes.includes(opt) ? 'border-gold bg-gold' : 'border-slate-300 bg-white'}`}>
                          {formData.dirtTypes.includes(opt) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.dirtTypes.includes(opt)}
                          onChange={() => toggleArrayItem('dirtTypes', opt)}
                          className="hidden"
                        />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-gold transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Observações */}
            <section id="observations-section">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Notas Adicionais e Observações Especiais</label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-8 bg-warm-grey/30 border border-midnight/5 rounded-[32px] focus:border-gold outline-none transition-all resize-none text-midnight font-serif text-lg leading-relaxed"
                placeholder="Descreva aqui detalhes específicos do serviço..."
              />
            </section>

            {/* Section: Signatures & Price */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Responsável Técnico</label>
                <div className="border-b border-gold bg-cool-grey rounded-t-[24px] h-28 flex flex-col items-center justify-center">
                  <span className="font-signature text-3xl text-midnight">Fábio Sinhoreli Aguiar</span>
                  <span className="text-[8px] uppercase tracking-widest text-gold mt-1 font-bold">F&E Clean Specialist</span>
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Assinatura do Cliente</label>
                <div className="border-b border-gold bg-cool-grey rounded-t-[24px]">
                  <SignatureCanvas
                    ref={clientSigRef}
                    penColor="#0a0f1a"
                    canvasProps={{ className: "w-full h-28 cursor-crosshair" }}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="bg-midnight text-white p-8 rounded-[32px] shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-gold relative z-10">Investimento</label>
                  <div className="flex items-center gap-3 relative z-10">
                    <span className="text-2xl font-serif font-bold text-gold">R$</span>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-4xl font-serif font-bold py-1 transition-colors"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Info */}
          <div className="p-12 bg-midnight text-white/40 border-t border-white/5 mt-auto">
            <div className="flex flex-wrap justify-between items-center gap-10 text-[9px] font-bold uppercase tracking-[0.3em]">
              <div className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-gold" />
                Selo de Qualidade F&E Clean
              </div>
              <div className="flex items-center gap-3">
                <Droplets size={16} className="text-gold" />
                Ativos Biodegradáveis
              </div>
              <div className="flex items-center gap-3">
                <Wind size={16} className="text-gold" />
                Secagem Inteligente
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Phone size={16} className="text-gold" />
                (16) 920047362
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <Instagram size={16} className="text-gold" />
                @feclean1
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Action Button (Mobile) */}
        <div className="fixed bottom-10 right-10 no-print block md:hidden z-50">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-16 h-16 bg-midnight text-white rounded-full shadow-3xl flex items-center justify-center hover:bg-gold transition-all active:scale-95"
          >
            {isGenerating ? (
              <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : (
              <Download size={28} />
            )}
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .shadow-3xl { shadow: none !important; }
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.5;
          filter: invert(0.5);
        }

        ::selection {
          background: #c5a059;
          color: white;
        }
      `}</style>
    </div>
  );
}
