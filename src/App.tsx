/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Menu,
  X,
  Instagram,
  LayoutDashboard,
  Phone,
  CheckCircle,
  ArrowRight,
  MapPin,
  Mail,
  ChevronDown,
  ChevronUp,
  Facebook,
  Star,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';

import fotoSofaMetade from './foto_sofa_metade.jpg';
import fotoCadeira from './foto_cadeira.jpg';
import fotoSofaExtratora1 from './foto_sofa_extratora1.png';
import fotoCarro from './foto_carro.png';
import foto2 from './foto_2.png';
import foto7 from './foto_7.png';
import resultadoNovo1 from './resultado_novo_1.png';
import resultadoNovo2 from './resultado_novo_2.png';
import resultadoColchaoClean from './resultado_colchao_clean.png';
import fundoSite from './fundo_site.png';
import logo from './logo_sem_fundo.png';

import AdminLogin from './components/admin/AdminLogin';
import AdminPanel from './components/admin/AdminPanel';
import { saveContactMessage } from './lib/db';

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
          <div className="min-h-screen font-sans text-white selection:bg-gold/20 bg-[#050810] relative">
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
    <div className="min-h-screen font-sans text-white selection:bg-gold/20 bg-[#050810] relative">
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

/* ─── Service Card Data ─── */
const services = [
  { title: 'HIGIENIZAÇÃO\nDE SOFÁ', img: fotoSofaMetade },
  { title: 'HIGIENIZAÇÃO\nDE COLCHÕES', img: resultadoColchaoClean },
  { title: 'IMPERMEABILIZAÇÃO\nDE ESTOFADOS', img: fotoSofaExtratora1 },
  { title: 'LIMPEZA DE\nESTOFADOS AUTOMOTIVOS', img: fotoCarro },
  { title: 'LIMPEZA DE\nCADEIRAS', img: fotoCadeira },
  { title: 'REVITALIZAÇÃO\nDE ESTOFADOS', img: foto2 },
];

const galleryImages = [fotoSofaMetade, fotoCadeira, fotoSofaExtratora1, fotoCarro, foto2, foto7, resultadoNovo1, resultadoNovo2];

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="inline-block flex-shrink-0">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.742.002-2.602-1.01-5.05-2.85-6.892C16.643 2.13 14.195 1.117 11.99 1.117c-5.444 0-9.866 4.372-9.87 9.746-.002 1.8.498 3.562 1.448 5.122L2.556 20.4l4.091-1.246zM17.65 14.73c-.31-.155-1.836-.905-2.12-.108c-.285.8-.285.45-.635.85s-.703.45-1.12.22c-.417-.22-1.76-.648-3.35-2.065-1.24-1.107-2.074-2.473-2.316-2.89c-.244-.416-.025-.64.183-.846c.188-.186.417-.487.625-.73c.207-.245.277-.417.417-.695c.14-.277.07-.52-.035-.73c-.105-.21-.836-2.023-1.146-2.77c-.302-.727-.607-.627-.836-.639c-.215-.01-.462-.01-.71-.01c-.248 0-.65.093-.99.462c-.34.37-1.302 1.272-1.302 3.102c0 1.828 1.33 3.6 1.518 3.85c.188.25 2.613 3.99 6.33 5.6c.883.38 1.573.608 2.112.78c.887.28 1.696.24 2.333.146c.71-.106 1.837-.75 2.09-1.47c.254-.72.254-1.34.177-1.47c-.076-.13-.284-.28-.59-.44z"/>
  </svg>
);

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', whatsapp: '', neighborhood: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Testimonials Carousel scroll
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialsRef.current) {
      const scrollAmount = 320;
      if (direction === 'left') {
        testimonialsRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        testimonialsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.whatsapp || !formData.neighborhood || !formData.message) {
      setSubmitError('Por favor, preencha todos os campos do formulário.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await saveContactMessage({
        name: formData.name,
        phone: formData.whatsapp,
        neighborhood: formData.neighborhood,
        message: formData.message
      });
      
      setSubmitSuccess(true);
      
      // Open WhatsApp in a new tab with message details
      const waText = encodeURIComponent(
        `Olá F&E Clean! Me chamo *${formData.name}*.\n` +
        `*WhatsApp:* ${formData.whatsapp}\n` +
        `*Bairro:* ${formData.neighborhood}\n` +
        `*Mensagem:* ${formData.message}`
      );
      window.open(`https://wa.me/5516920047362?text=${waText}`, '_blank');
      
      setFormData({ name: '', whatsapp: '', neighborhood: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setSubmitError('Houve um erro ao enviar sua mensagem. Por favor, tente novamente ou clique no botão do WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Como é feito o orçamento para limpeza e higienização de sofás, camas e estofados?",
      a: "O orçamento é feito de forma totalmente online e rápida através do nosso WhatsApp. Você só precisa nos enviar uma foto do seu estofado ou descrever o tipo de móvel para que possamos avaliar o tecido, tamanho e grau de sujidade, e te enviamos o valor na hora."
    },
    {
      q: "Quanto tempo demora para secar o sofá ou a cama após a execução da limpeza e higienização?",
      a: "A secagem leva em média de 2 a 6 horas. O tempo exato varia de acordo com a ventilação do ambiente e o tipo de tecido. Como utilizamos extratoras profissionais de alta potência, removemos até 90% da água, garantindo uma secagem rápida e sem odores."
    },
    {
      q: "Quanto tempo demora o trabalho de limpeza e higienização de sofás e camas?",
      a: "O processo de limpeza dura em média de 1h30 a 2h30 por móvel, dependendo das dimensões do estofado e da intensidade das manchas ou sujidade."
    },
    {
      q: "A limpeza e higienização de sofá é feita em minha residência?",
      a: "Sim! Todo o serviço é realizado diretamente no conforto do seu lar, escritório ou comércio. Nossa equipe leva todos os equipamentos e produtos necessários, garantindo total comodidade e segurança para você."
    },
    {
      q: "Qual a forma de pagamento a F&E Clean recebe?",
      a: "Aceitamos diversas formas de pagamento para sua comodidade: Pix, cartões de débito e cartões de crédito (com opção de parcelamento), além de dinheiro em espécie."
    }
  ];

  const testimonials = [
    {
      name: "monalisa pereira",
      date: "2022-08-08",
      text: "Atendimento muito boa,excelente empresa.gostei muito da limpeza,fiz uma cama e o meu estofado, ficou muito bom o cheiro muito",
      initials: "M",
      avatarBg: "bg-pink-600"
    },
    {
      name: "Cynthia Pereira",
      date: "2022-07-11",
      text: "Atendimento top, prestadores educados e serviço de qualidade fora o preço . Se preocupam com os clientes e são organizados ✅",
      initials: "C",
      avatarBg: "bg-blue-600"
    },
    {
      name: "Joyce Lopes",
      date: "2022-07-03",
      text: "Os melhores no que faz, super indico, agilidade, excelência, fora o cheiroooo que ficou exalando por toda casa!!",
      initials: "J",
      avatarBg: "bg-teal-600"
    },
    {
      name: "Ruth Cardoso Rodrigues",
      date: "2021-11-27",
      text: "Amei o resultados das cadeiras e sofá, fora que o técnico super simpático explicou tudo que seria feito, George muito obrigado.",
      initials: "R",
      avatarBg: "bg-purple-600"
    }
  ];

  return (
    <div 
      className="min-h-screen font-sans text-slate-800 selection:bg-brand-blue/20 bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${fundoSite})` }}
    >
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="F&E Clean Logo" className="h-12 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-sans font-extrabold text-xl tracking-tight leading-none text-slate-900">
                F<span className="text-brand-blue font-bold">&amp;</span>E Clean
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-brand-blue font-bold">Higienização de Estofados</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#servicos" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-blue transition-colors">Serviços</a>
            <a href="#sobre" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-blue transition-colors">Sobre</a>
            <a href="#resultados" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-blue transition-colors">Resultados</a>
            <a href="#depoimentos" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-blue transition-colors">Depoimentos</a>
            <a href="#faq" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-brand-blue transition-colors">Dúvidas</a>
            
            <a
              href="https://wa.me/5516920047362"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-brand-green text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-green-hover transition-all active:scale-95 flex items-center gap-2 shadow-md shadow-brand-green/20"
            >
              <WhatsAppIcon size={14} />
              Orçamento
            </a>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
            >
              <LayoutDashboard size={14} className="text-slate-500" /> Admin
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-6 py-6 flex flex-col gap-4 shadow-lg">
            <a href="#servicos" className="text-sm font-bold uppercase tracking-widest text-slate-700" onClick={() => setIsMenuOpen(false)}>Serviços</a>
            <a href="#sobre" className="text-sm font-bold uppercase tracking-widest text-slate-700" onClick={() => setIsMenuOpen(false)}>Sobre</a>
            <a href="#resultados" className="text-sm font-bold uppercase tracking-widest text-slate-700" onClick={() => setIsMenuOpen(false)}>Resultados</a>
            <a href="#depoimentos" className="text-sm font-bold uppercase tracking-widest text-slate-700" onClick={() => setIsMenuOpen(false)}>Depoimentos</a>
            <a href="#faq" className="text-sm font-bold uppercase tracking-widest text-slate-700" onClick={() => setIsMenuOpen(false)}>Dúvidas</a>
            
            <a
              href="https://wa.me/5516920047362"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-brand-green text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-sm"
              onClick={() => setIsMenuOpen(false)}
            >
              <WhatsAppIcon size={16} /> Solicitar Orçamento
            </a>
            <button
              onClick={() => { navigate('/admin/dashboard'); setIsMenuOpen(false); }}
              className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <LayoutDashboard size={16} /> Painel Admin
            </button>
          </div>
        )}
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-16 px-6 z-10 bg-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-blue">Ribeirão Preto e Região</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-sans font-black tracking-tight mb-6 leading-tight text-slate-900">
              O QUE VOCÊ <span className="text-brand-blue italic">PRECISA?</span>
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Utilizamos produtos e equipamentos especializados. Nossa equipe promove uma limpeza profunda,
              deixando o acabamento totalmente limpo, com cheiro agradável e livre de fungos, bactérias e ácaros.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Services Grid ─── */}
      <section id="servicos" className="pb-16 px-6 relative z-10 bg-transparent">
        <div className="max-w-5xl mx-auto">
          {/* First Row - 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {services.slice(0, 3).map((service, i) => (
              <ServiceCard key={i} service={service} delay={i * 0.1} />
            ))}
          </div>
          {/* Second Row - 3 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {services.slice(3, 6).map((service, i) => (
              <ServiceCard key={i + 3} service={service} delay={(i + 3) * 0.1} />
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <a
            href="https://wa.me/5516920047362"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-brand-green hover:bg-brand-green-hover text-white rounded-full font-bold uppercase tracking-widest text-sm hover:shadow-xl hover:shadow-brand-green/20 transition-all active:scale-95 flex items-center gap-3 shadow-lg"
          >
            <WhatsAppIcon size={20} />
            Solicitar orçamento
          </a>
        </div>
      </section>

      {/* ─── Seção "SOBRE A F&E CLEAN" (Imagem 5) ─── */}
      <section id="sobre" className="py-20 px-6 bg-brand-blue text-white relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Chair cleaning image */}
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
            <img 
              src={fotoCadeira} 
              alt="Profissional da F&E Clean higienizando cadeiras de jantar" 
              className="w-full h-[400px] object-cover"
            />
          </div>
          {/* Right: Content */}
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight mb-2 uppercase">
              SOBRE A F&E CLEAN
            </h2>
            <div className="flex gap-1 mb-6 text-yellow-400">
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
              <Star size={18} fill="currentColor" />
            </div>
            
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-6">
              Somos uma empresa especializada em levar mais saúde para o seu lar, através da limpeza e higienização de sofás, colchões, tapetes e estofados em geral. Realizamos a Higienização e lavagem a seco do seu estofado com produtos que realmente fazem a diferença nos cuidados com sua casa ou local de trabalho. Todos testados e aprovados para solucionar seu problema com a sujeira.
            </p>

            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm md:text-base font-semibold">
                <div className="w-6 h-6 bg-white text-brand-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ChevronRight size={14} strokeWidth={3} className="text-brand-blue" />
                </div>
                <span>Produtos de qualidade</span>
              </li>
              <li className="flex items-center gap-3 text-sm md:text-base font-semibold">
                <div className="w-6 h-6 bg-white text-brand-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ChevronRight size={14} strokeWidth={3} className="text-brand-blue" />
                </div>
                <span>Atendimento personalizado</span>
              </li>
              <li className="flex items-center gap-3 text-sm md:text-base font-semibold">
                <div className="w-6 h-6 bg-white text-brand-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <ChevronRight size={14} strokeWidth={3} className="text-brand-blue" />
                </div>
                <span>Excelente relacionamento com os clientes</span>
              </li>
            </ul>

            <a
              href="https://wa.me/5516920047362"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 px-6 py-3 bg-brand-green hover:bg-brand-green-hover text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 w-fit transition-all hover:shadow-lg active:scale-95"
            >
              <WhatsAppIcon size={14} />
              Solicitar orçamento
            </a>
          </div>
        </div>
      </section>

      {/* ─── Seção "NÓS VAMOS ATÉ VOCÊ!" (Imagem 4) ─── */}
      <section className="py-24 px-6 bg-white relative z-10 text-slate-800 overflow-hidden">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative">
          {/* Left: Extractor sofa cleaning image */}
          <div className="md:col-span-7 rounded-[2rem] overflow-hidden shadow-2xl relative z-0">
            <img 
              src={fotoSofaMetade} 
              alt="Higienização de sofá com máquina extratora" 
              className="w-full h-[400px] object-cover"
            />
          </div>
          {/* Right: Floating White Card overlapping the image */}
          <div className="md:col-span-5 md:-ml-20 bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-10 relative">
            <h2 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight text-brand-blue mb-6">
              NÓS VAMOS ATÉ VOCÊ!
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4">
              Higienizamos, eliminando bactérias, fungos e ácaros. O produto é auto - secante, sem necessidade de exposição ao Sol. Seu estofado estará totalmente seco em apenas algumas horas.
            </p>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Atendemos toda a Ribeirão Preto e região sem taxa de deslocamento. Oferecemos um atendimento rápido e eficiente para máxima satisfação de nossos clientes!
            </p>

            <a
              href="https://wa.me/5516920047362"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 w-fit transition-all hover:shadow-lg active:scale-95 shadow-md"
            >
              <WhatsAppIcon size={14} />
              Solicitar orçamento
            </a>
          </div>
        </div>
      </section>

      {/* ─── Results Gallery ─── */}
      <section id="resultados" className="py-20 px-6 relative z-10 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-sans font-black tracking-tight uppercase text-brand-blue">
              VEJA ALGUNS DE NOSSOS <span className="text-slate-800 italic">RESULTADOS</span>
            </h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
              A Clean realiza um processo de limpeza profunda no qual eliminamos toda sujidade e proliferação de
              microrganismos causadores de doenças alérgicas e respiratórias.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ scale: 1.04 }}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-slate-100"
              >
                <img src={img} alt={`Resultado ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Seção "DEPOIMENTOS" (Imagem 3) ─── */}
      <section id="depoimentos" className="py-20 px-6 bg-[#f2f4f7] relative z-10 text-slate-800">
        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-3xl md:text-4xl font-sans font-black tracking-tight text-brand-blue text-center mb-2 uppercase">
            DEPOIMENTOS
          </h2>
          <p className="text-slate-500 text-center text-sm md:text-base mb-12">
            Veja o que nossos clientes dizem sobre nós
          </p>

          {/* Testimonial Cards Slider Container */}
          <div className="relative px-4 md:px-10">
            {/* Scroll buttons */}
            <button 
              onClick={() => scrollTestimonials('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 z-20 text-slate-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => scrollTestimonials('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 z-20 text-slate-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>

            {/* Testimonials list */}
            <div 
              ref={testimonialsRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-6 px-2 scroll-smooth"
            >
              {testimonials.map((t, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-[260px] min-w-[285px] max-w-[285px] md:min-w-[260px] md:max-w-[260px] lg:min-w-[280px] lg:max-w-[280px] snap-start"
                >
                  <div>
                    {/* Top bar of testimonial card */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${t.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0`}>
                          {t.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-none whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                            {t.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">{t.date}</p>
                        </div>
                      </div>
                      
                      {/* Colored Google G Icon */}
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" width="20" height="20">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Stars and verified icon */}
                    <div className="flex items-center gap-1.5 mb-3 text-yellow-400">
                      <div className="flex gap-0.5">
                        <Star size={12} fill="currentColor" className="stroke-none" />
                        <Star size={12} fill="currentColor" className="stroke-none" />
                        <Star size={12} fill="currentColor" className="stroke-none" />
                        <Star size={12} fill="currentColor" className="stroke-none" />
                        <Star size={12} fill="currentColor" className="stroke-none" />
                      </div>
                      <div className="w-3.5 h-3.5 bg-slate-400 text-white rounded-full flex items-center justify-center text-[8px] flex-shrink-0 font-bold">
                        <Check size={8} strokeWidth={4} />
                      </div>
                    </div>

                    {/* Review text */}
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-5">
                      "{t.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-900 text-center font-bold text-xs md:text-sm mt-8">
            Avaliação totalizada Google 4.7 de 5, com base em 12 avaliações.
          </p>
        </div>
      </section>

      {/* ─── Seção "ESCLAREÇA SUAS DÚVIDAS" (Imagem 1) ─── */}
      <section id="faq" className="py-20 px-6 bg-white relative z-10">
        <div className="max-w-4xl mx-auto bg-white border border-brand-blue/30 rounded-[2rem] p-6 md:p-12 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-brand-blue text-center mb-8 uppercase">
            ESCLAREÇA SUAS DÚVIDAS
          </h2>
          
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-1">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left py-4 flex justify-between items-center text-slate-800 hover:text-brand-blue transition-colors focus:outline-none cursor-pointer"
                  >
                    <span className="text-sm md:text-base font-bold pr-4 leading-tight text-brand-blue">
                      <span className="inline-block mr-2 text-xs">▶</span> {faq.q}
                    </span>
                    <span className="text-brand-blue flex-shrink-0">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-slate-600 text-sm leading-relaxed pb-4 pl-5">
                      {faq.a}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-10">
            <a
              href="https://wa.me/5516920047362"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <WhatsAppIcon size={14} />
              Solicitar orçamento
            </a>
          </div>
        </div>
      </section>

      {/* ─── Seção "FALE CONOSCO" (Imagem 2) ─── */}
      <section id="contato" className="py-16 px-6 bg-brand-blue text-white relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <div className="flex flex-col">
            <h2 className="text-3xl font-sans font-extrabold tracking-tight mb-6 uppercase">
              FALE CONOSCO
            </h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed mb-8">
              Quando o assunto é limpeza e higienização de estofados, a F&E Clean possui as soluções ideais para te atender da melhor forma possível. Entre em contato conosco através do WhatsApp ou preencha os campos do formulário. Responderemos o mais rápido possível!
            </p>

            <a
              href="https://wa.me/5516920047362"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-brand-green hover:bg-brand-green-hover text-white rounded-full font-bold text-xs md:text-sm flex items-center gap-2 w-fit shadow-lg mb-10 transition-all hover:shadow-brand-green/30 active:scale-95"
            >
              <WhatsAppIcon size={16} />
              Agende seu serviço conosco! (16) 92064-7362
            </a>

            <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/70 mb-4">
              SIGA NOSSAS REDES SOCIAIS
            </span>
            
            <div className="flex gap-4">
              <a 
                href="https://wa.me/5516920047362" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#1877F2] text-white hover:bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <Facebook size={22} fill="currentColor" className="stroke-none" />
              </a>
              <a 
                href="https://instagram.com/feclean1" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#E1306C] text-white hover:bg-pink-600 w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <Instagram size={22} />
              </a>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="bg-transparent">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white text-slate-800 px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  required
                />
              </div>
              
              <div>
                <input 
                  type="text" 
                  placeholder="Whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-white text-slate-800 px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  required
                />
              </div>

              <div>
                <input 
                  type="text" 
                  placeholder="Bairro"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full bg-white text-slate-800 px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  required
                />
              </div>

              <div>
                <textarea 
                  placeholder="Mensagem"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full bg-white text-slate-800 px-4 py-3 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
                  required
                />
              </div>

              {submitError && (
                <p className="text-red-300 text-xs font-bold">{submitError}</p>
              )}

              {submitSuccess && (
                <p className="text-emerald-300 text-xs font-bold">Mensagem enviada com sucesso! Redirecionando para o WhatsApp...</p>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#eef2f5] hover:bg-white text-slate-700 font-bold px-6 py-3 rounded text-sm transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── Rodapé (Footer) ─── */}
      <footer className="bg-black py-8 px-6 text-center text-white/50 text-[10px] md:text-xs font-semibold relative z-10">
        <a 
          href="https://wa.me/5516920047362" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#e04060] hover:text-[#f85c7c] transition-colors mb-3 block font-bold uppercase tracking-widest"
        >
          Política de Privacidade
        </a>
        <p className="text-slate-400">
          Copyright © 2026 – F&E Clean Higienização de Estofados – Todos os direitos reservados
        </p>
      </footer>

      {/* Floating WhatsApp Action Button */}
      <a 
        href="https://wa.me/5516920047362" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 w-16 h-16 bg-brand-green text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-green-hover transition-all duration-300 hover:scale-110 z-50 hover:shadow-brand-green/50 active:scale-95"
        style={{ boxShadow: '0 8px 30px rgba(15,156,46,0.4)' }}
      >
        <WhatsAppIcon size={30} />
      </a>
    </div>
  );
}

/* ─── Service Card Component ─── */
function ServiceCard({ service, delay }: { key?: React.Key; service: { title: string; img: string }; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6 }}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-brand-blue/30 shadow-md group-hover:border-brand-blue group-hover:shadow-lg transition-all duration-300">
        <img
          src={service.img}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
        {/* Label overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-brand-blue/95 px-4 py-3 text-center transition-colors duration-300 group-hover:bg-brand-blue">
          <span className="text-white text-xs md:text-sm font-bold uppercase tracking-wider leading-tight whitespace-pre-line">
            {service.title}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
