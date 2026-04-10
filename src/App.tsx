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
          const observationsSection = clonedDoc.getElementById('observations-section');
          
          if (clonedElement && observationsSection) {
            clonedElement.style.width = `${captureWidth}px`;
            clonedElement.style.height = 'auto';
            
            // Cria um espaçador para empurrar as observações para a segunda página
            // A altura de uma página A4 proporcional à nossa largura de 800px é aprox 1130px
            const spacer = clonedDoc.createElement('div');
            spacer.style.height = '150px'; // Ajuste fino para empurrar para a próxima página
            spacer.className = 'pdf-spacer';
            observationsSection.parentNode?.insertBefore(spacer, observationsSection);
          }
          
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            #pdf-content {
              background: white !important;
              box-shadow: none !important;
              width: ${captureWidth}px !important;
            }
            #pdf-content * {
              box-shadow: none !important;
              text-shadow: none !important;
              border-color: #d1d5db !important;
              color: black !important;
            }
            #pdf-content .no-print { display: none !important; }
            #pdf-content .bg-blue-600 { background-color: #2563eb !important; color: white !important; }
            #pdf-content .bg-blue-900 { background-color: #111827 !important; color: white !important; }
            #pdf-content .bg-slate-50 { background-color: #f9fafb !important; }
            #pdf-content .bg-blue-500 { background-color: #374151 !important; }
            #pdf-content .bg-blue-200 { background-color: #e5e7eb !important; }
            
            /* Fallbacks para cores oklch do Tailwind v4 que o html2canvas não suporta */
            #pdf-content .text-slate-500 { color: #64748b !important; }
            #pdf-content .text-slate-700 { color: #334155 !important; }
            #pdf-content .text-slate-400 { color: #94a3b8 !important; }
            #pdf-content .text-blue-600 { color: #2563eb !important; }
            #pdf-content .text-blue-400 { color: #60a5fa !important; }
            #pdf-content .text-blue-300 { color: #93c5fd !important; }
            #pdf-content .border-slate-200 { border-color: #e2e8f0 !important; }
            #pdf-content .border-slate-300 { border-color: #cbd5e1 !important; }
            
            #pdf-content input, 
            #pdf-content textarea, 
            #pdf-content select {
              border-bottom-color: #9ca3af !important;
              background: transparent !important;
            }
            
            #pdf-content svg path, 
            #pdf-content svg circle {
              fill: black !important;
              stroke: black !important;
            }
            #pdf-content .bg-blue-900 svg text,
            #pdf-content .bg-blue-900 svg path,
            #pdf-content .bg-blue-900 svg circle {
              fill: white !important;
              stroke: white !important;
            }
            #pdf-content .font-signature { 
              font-family: "Dancing Script", cursive !important; 
              color: #1e3a8a !important;
            }
          `;
          clonedDoc.head.appendChild(style);
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
      <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="F&E Clean Logo" 
                className="h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-xl tracking-tight text-blue-900">F&E Clean</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#inicio" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Início</a>
              <a href="#servicos" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Serviços</a>
              <button 
                onClick={() => setView('generator')}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                Gerador de OS
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-white border-b border-slate-100 px-6 py-8 flex flex-col gap-6"
            >
              <a href="#inicio" className="text-lg font-medium text-slate-600" onClick={() => setIsMenuOpen(false)}>Início</a>
              <a href="#servicos" className="text-lg font-medium text-slate-600" onClick={() => setIsMenuOpen(false)}>Serviços</a>
              <button 
                onClick={() => { setView('generator'); setIsMenuOpen(false); }}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold"
              >
                Gerador de OS
              </button>
            </motion.div>
          )}
        </nav>

        {/* Hero Section */}
        <section id="inicio" className="pt-32 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-7"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-8">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Premium Cleaning Service</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 tracking-tighter text-slate-900">
                  RENOVE <br />
                  <span className="text-blue-600 italic">SEU CONFORTO.</span>
                </h1>
                <p className="text-xl text-slate-500 mb-12 max-w-xl leading-relaxed font-medium">
                  Especialistas em higienização técnica e impermeabilização de estofados. Tecnologia avançada para um ambiente impecável.
                </p>
                <div className="flex flex-wrap gap-6">
                  <button 
                    onClick={() => setView('generator')}
                    className="h-16 px-10 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 group"
                  >
                    Gerar Ordem de Serviço
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <a 
                    href="https://wa.me/5516920047362" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-16 px-10 bg-white border-2 border-slate-900 text-slate-900 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                  >
                    WhatsApp
                    <MessageCircle size={20} className="text-green-500" />
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative aspect-[4/5] bg-slate-100 rounded-[40px] overflow-hidden shadow-2xl border-8 border-white group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.8, ease: "circOut" }}
                      className="absolute inset-0"
                    >
                      <img 
                        src={heroImages[currentImageIndex].url} 
                        alt={`F&E Clean Showcase ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      
                      {/* Image Label */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-8 left-8"
                      >
                        <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                          {heroImages[currentImageIndex].label}
                        </span>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Progress Indicators */}
                  <div className="absolute bottom-8 right-8 flex gap-1.5">
                    {heroImages.map((_, i) => (
                      <div 
                        key={i}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          i === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute top-12 -left-20 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 hidden md:block z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="text-green-600" size={24} />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Certificado</p>
                        <p className="text-sm font-bold text-slate-900">Garantia Total</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-20" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-20" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-32 bg-slate-50 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">Nossos <br /><span className="text-blue-600">Serviços</span></h2>
                <p className="text-lg text-slate-500 font-medium">Excelência técnica em cada detalhe, do sofá ao colchão.</p>
              </div>
              <button 
                onClick={() => setView('generator')}
                className="text-sm font-black uppercase tracking-widest text-blue-600 border-b-2 border-blue-600 pb-1 hover:text-blue-800 hover:border-blue-800 transition-colors"
              >
                Ver todos os serviços
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Higienização', icon: <Droplets size={32} />, desc: 'Limpeza profunda com extração de sujidades e microrganismos.', color: 'bg-blue-500' },
                { title: 'Impermeabilização', icon: <ShieldCheck size={32} />, desc: 'Blindagem contra líquidos e aumento da vida útil do tecido.', color: 'bg-slate-900' },
                { title: 'Odorização', icon: <Wind size={32} />, desc: 'Neutralização de odores e fragrância exclusiva de limpeza.', color: 'bg-blue-600' }
              ].map((service, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className={`${service.color} p-12 rounded-[40px] text-white flex flex-col h-[400px] justify-between group cursor-pointer shadow-xl`}
                >
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold mb-4 tracking-tight">{service.title}</h3>
                    <p className="text-white/70 font-medium leading-relaxed">{service.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Results Gallery Section */}
        <section className="py-32 bg-white px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-4">Nosso Processo</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Galeria de <br /><span className="text-blue-600">Resultados</span></h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {heroImages.map((img, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-square rounded-3xl overflow-hidden shadow-lg group cursor-pointer"
                >
                  <img 
                    src={img.url} 
                    alt={`Resultado ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                      {img.label}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-100 pt-32 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-32">
              <div className="md:col-span-6">
                <div className="flex items-center gap-4 mb-10">
                  <img 
                    src={logo} 
                    alt="F&E Clean Logo" 
                    className="h-16 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <span className="font-black text-2xl tracking-tighter uppercase">F&E Clean</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter mb-10 leading-none">
                  PRONTO PARA <br />
                  <span className="text-blue-600">TRANSFORMAR</span> <br />
                  SEU AMBIENTE?
                </h3>
                <div className="flex gap-4">
                  <a 
                    href="https://wa.me/5516920047362" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-14 px-8 bg-green-500 text-white rounded-2xl font-bold flex items-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-100 active:scale-95"
                  >
                    WhatsApp
                    <MessageCircle size={20} />
                  </a>
                  <a 
                    href="https://instagram.com/feclean1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all active:scale-95"
                  >
                    <Instagram size={24} />
                  </a>
                </div>
              </div>

              <div className="md:col-span-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Navegação</p>
                <ul className="space-y-6">
                  <li><a href="#inicio" className="text-lg font-bold hover:text-blue-600 transition-colors">Início</a></li>
                  <li><a href="#servicos" className="text-lg font-bold hover:text-blue-600 transition-colors">Serviços</a></li>
                  <li><button onClick={() => setView('generator')} className="text-lg font-bold hover:text-blue-600 transition-colors">Gerador de OS</button></li>
                </ul>
              </div>

              <div className="md:col-span-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Contato</p>
                <ul className="space-y-6">
                  <li className="text-lg font-bold">(16) 920047362</li>
                  <li className="text-lg font-bold text-slate-400">fe.cleanhigienizacao@gmail.com</li>
                  <li className="text-lg font-bold text-slate-400">Ribeirão Preto, SP</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <p>© 2026 F&E Clean. Todos os direitos reservados.</p>
              <div className="flex gap-8">
                <a href="#" className="hover:text-slate-900 transition-colors">Privacidade</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Termos</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-6 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('landing')}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              title="Voltar para o site"
            >
              <ArrowRight className="rotate-180 text-slate-600" size={24} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="text-blue-600" />
              Gerador de OS
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={clearSignatures}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm text-sm"
            >
              <Eraser size={16} />
              Limpar Assinaturas
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 text-sm font-medium"
            >
              {isGenerating ? (
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
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
          className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-200 relative"
          style={{ minHeight: '1120px' }} // A4 aspect ratio approx
        >
          {/* Logo Section */}
          <div className="p-8 text-center border-b-4 border-blue-900">
            <div className="flex flex-col items-center justify-center mb-4">
              <img 
                src={logo} 
                alt="F&E Clean Logo" 
                className="h-32 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-3xl font-bold text-blue-900 mt-4 tracking-[0.3em] uppercase border-y-2 border-[#BCC4DC] py-4">
              Ordem de Serviço
            </h3>
          </div>

          <div className="p-8 space-y-8">
            {/* Section: Cliente */}
            <section>
              <h4 className="flex items-center gap-2 text-lg font-bold text-blue-900 uppercase mb-4 border-l-4 border-blue-900 pl-3">
                <User size={20} /> Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="w-full border-b-2 border-slate-200 focus:border-blue-600 outline-none py-2 text-lg font-medium transition-colors"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
                  <div className="flex items-center gap-2 border-b-2 border-slate-200 focus-within:border-blue-600 transition-colors">
                    <Phone size={16} className="text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full outline-none py-2 text-lg font-medium"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                  <div className="flex items-center gap-2 border-b-2 border-slate-200 focus-within:border-blue-600 transition-colors">
                    <Calendar size={16} className="text-slate-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full outline-none py-2 text-lg font-medium"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Serviço a ser Executado</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full border-b-2 border-slate-200 focus:border-blue-600 outline-none py-2 text-lg font-medium bg-transparent cursor-pointer"
                  >
                    <option value="Higienização">Higienização</option>
                    <option value="Impermeabilização">Impermeabilização</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Section: Análise Técnica */}
            <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <h4 className="flex items-center gap-2 text-lg font-bold text-blue-900 uppercase mb-6 border-l-4 border-blue-900 pl-3">
                <Info size={20} /> Análise Técnica
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tipo de Superfície */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Tipo de Superfície (Tecido)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FABRIC_OPTIONS.map(fabric => (
                      <label key={fabric} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.fabrics.includes(fabric)}
                          onChange={() => toggleArrayItem('fabrics', fabric)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{fabric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Grau de Sujidade */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3 text-center">Grau de Sujidade</label>
                  <div className="relative pt-2 pb-2">
                    <div className="flex h-8 w-full rounded-md overflow-hidden border border-slate-300">
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, dirtLevel: 'Leve' }))}
                        className={`flex-1 transition-all ${formData.dirtLevel === 'Leve' ? 'bg-blue-200' : 'bg-white hover:bg-slate-50'}`}
                      />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, dirtLevel: 'Moderado' }))}
                        className={`flex-1 border-x border-slate-300 transition-all ${formData.dirtLevel === 'Moderado' ? 'bg-blue-500' : 'bg-white hover:bg-slate-50'}`}
                      />
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, dirtLevel: 'Intenso' }))}
                        className={`flex-1 transition-all ${formData.dirtLevel === 'Intenso' ? 'bg-blue-900' : 'bg-white hover:bg-slate-50'}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mt-2 px-1">
                      <span className={formData.dirtLevel === 'Leve' ? 'text-blue-600' : ''}>Leve</span>
                      <span className={formData.dirtLevel === 'Moderado' ? 'text-blue-600' : ''}>Moderado</span>
                      <span className={formData.dirtLevel === 'Intenso' ? 'text-blue-900' : ''}>Intenso</span>
                    </div>
                    {/* Visual pointer like in the image */}
                    <div 
                      className="absolute -top-1 transition-all duration-300"
                      style={{ left: formData.dirtLevel === 'Leve' ? '16.6%' : formData.dirtLevel === 'Moderado' ? '50%' : '83.3%' }}
                    >
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-blue-900 -ml-[6px]" />
                    </div>
                  </div>
                </div>

                {/* Situação do Estofado */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Situação do Estofado</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITION_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.conditions.includes(opt)}
                          onChange={() => toggleArrayItem('conditions', opt)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tipo de Sujeira */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-3">TIPO DE SUJEIRA</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIRT_TYPE_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.dirtTypes.includes(opt)}
                          onChange={() => toggleArrayItem('dirtTypes', opt)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {formData.dirtTypes.includes('Outros') && (
                    <input
                      type="text"
                      className="w-full mt-2 border-b border-slate-300 focus:border-blue-600 outline-none text-sm py-1 transition-colors"
                      placeholder="Especifique outros..."
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Section: Observações */}
            <section id="observations-section">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Observações</label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-600 outline-none transition-colors resize-none text-slate-700"
                placeholder="Detalhes adicionais sobre o serviço..."
              />
            </section>

            {/* Section: Signatures & Price */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">Assinatura do Técnico</label>
                <div className="border-b-2 border-slate-300 bg-[#FBFCFD] rounded-t-lg h-24 flex items-center justify-center">
                  <span className="font-signature text-3xl text-blue-900">Fábio Sinhoreli Aguiar</span>
                </div>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">Assinatura do Cliente</label>
                <div className="border-b-2 border-slate-300 bg-[#FBFCFD] rounded-t-lg">
                  <SignatureCanvas
                    ref={clientSigRef}
                    penColor="#1e3a8a"
                    canvasProps={{ className: "w-full h-24 cursor-crosshair" }}
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg">
                  <label className="block text-[10px] font-bold uppercase mb-1 opacity-80">Valor do Serviço</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black">R$</span>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-b-2 border-white/30 focus:border-white outline-none text-3xl font-black py-1 transition-colors"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Info */}
          <div className="p-8 bg-slate-50 border-t border-slate-200 mt-auto">
            <div className="flex flex-wrap justify-between items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-600" />
                Garantia de Qualidade F&E Clean
              </div>
              <div className="flex items-center gap-2">
                <Droplets size={14} className="text-blue-400" />
                Produtos Biodegradáveis
              </div>
              <div className="flex items-center gap-2">
                <Wind size={14} className="text-blue-300" />
                Secagem Rápida
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={14} className="text-blue-600" />
                (16) 920047362
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Instagram size={14} className="text-blue-600" />
                @feclean1
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Action Button (Mobile) */}
        <div className="fixed bottom-8 right-8 no-print block md:hidden">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
          >
            {isGenerating ? (
              <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : (
              <Download size={24} />
            )}
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; padding: 0; }
          .shadow-2xl { shadow: none !important; }
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: white;
          border: 4px solid #1e3a8a;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          opacity: 0.5;
          filter: invert(0.5);
        }
      `}</style>
    </div>
  );
}
