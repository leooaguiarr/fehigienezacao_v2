import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ClipboardCheck, User, Phone, Calendar, Info, Download, Eraser,
  Droplets, Wind, ShieldCheck, ArrowRight, Instagram, Save, CheckCircle,
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { saveServiceOrder, updateServiceOrder } from '../lib/db';
import type { ServiceOrder, ServiceType, DirtLevel, OSStatus } from '../types';
import logo from '../logo_sem_fundo.png';

const FABRIC_OPTIONS = ['Suede', 'Linho', 'Chenille', 'Algodão', 'Tecido Sintético'];
const CONDITION_OPTIONS = ['Novo', 'Manchado', 'Desbotado', 'Com Rasgos', 'Amassado', 'Com Odor'];
const DIRT_TYPE_OPTIONS = ['Mofo', 'Molho', 'Poeira', 'Terra', 'Outros'];

interface Props {
  editData?: ServiceOrder;
  onSaved?: (os: ServiceOrder) => void;
  onBack?: () => void;
  standalone?: boolean;
}

const emptyForm = (): Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'> => ({
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
  status: 'pendente',
});

export default function OSGenerator({ editData, onSaved, onBack, standalone }: Props) {
  const [formData, setFormData] = useState<Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>>(
    editData
      ? {
          clientName: editData.clientName,
          phone: editData.phone,
          date: editData.date,
          serviceType: editData.serviceType,
          fabrics: editData.fabrics,
          dirtLevel: editData.dirtLevel,
          conditions: editData.conditions,
          dirtTypes: editData.dirtTypes,
          observations: editData.observations,
          price: editData.price,
          status: editData.status,
        }
      : emptyForm()
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | undefined>(editData?.id);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const clientSigRef = useRef<SignatureCanvas>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleArrayItem = (name: keyof typeof formData, item: string) => {
    setFormData((prev) => {
      const current = prev[name] as string[];
      return {
        ...prev,
        [name]: current.includes(item) ? current.filter((i) => i !== item) : [...current, item],
      };
    });
  };

  const clearSignatures = () => clientSigRef.current?.clear();

  const handleSave = async () => {
    if (!formData.clientName) return alert('Preencha o nome do cliente.');
    setIsSaving(true);
    try {
      if (savedId) {
        await updateServiceOrder(savedId, formData);
        onSaved?.({ ...formData, id: savedId });
      } else {
        const id = await saveServiceOrder(formData);
        setSavedId(id);
        onSaved?.({ ...formData, id });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar OS. Verifique a configuração do Firebase.');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    if (!formRef.current) return;
    setIsGenerating(true);
    try {
      const element = formRef.current;
      const captureWidth = 800;
      const originalWidth = element.style.width;
      element.style.width = `${captureWidth}px`;

      // Pequeno atraso para garantir que estilos estejam aplicados
      await new Promise((resolve) => setTimeout(resolve, 100));

      const imgData = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: captureWidth,
        style: {
          width: `${captureWidth}px`,
          transform: 'none',
        },
      });

      element.style.width = originalWidth;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`OS_FE_Clean_${formData.clientName.replace(/\s+/g, '_') || 'Sem_Nome'}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={standalone ? 'min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-white relative' : 'py-6 px-4 sm:px-6'}>
      {standalone && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gold/8 rounded-full blur-[180px]" />
        </div>
      )}

      <div className={`${standalone ? 'max-w-5xl mx-auto relative z-10' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8 no-print flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center glass-strong rounded-full hover:bg-gold hover:text-white transition-all active:scale-95"
              >
                <ArrowRight className="rotate-180" size={18} />
              </button>
            )}
            <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-3">
              <ClipboardCheck className="text-gold" size={28} />
              {editData?.id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </h1>
          </div>
          <div className="flex gap-3 flex-wrap">
            {saveSuccess && (
              <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                <CheckCircle size={16} /> Salvo!
              </span>
            )}
            <button
              onClick={clearSignatures}
              className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-full text-white/60 hover:text-white hover:border-white/30 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <Eraser size={14} /> Limpar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isSaving ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={14} />}
              {isSaving ? 'Salvando...' : savedId ? 'Atualizar OS' : 'Salvar OS'}
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 bg-gold text-white rounded-full hover:bg-gold-light transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isGenerating ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Download size={14} />}
              {isGenerating ? 'Gerando...' : 'Baixar PDF'}
            </button>
          </div>
        </div>

        {/* OS Document */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          ref={formRef}
          id="pdf-content"
          className="bg-white shadow-3xl rounded-[24px] overflow-hidden border border-white/10 text-midnight"
          style={{ minHeight: '1120px' }}
        >
          {/* Header do documento */}
          <div className="px-12 pt-10 pb-8 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
            <div className="flex flex-col items-center justify-center mb-4">
              <img src={logo} alt="F&E Clean Logo" className="h-24 w-auto object-contain brightness-0" />
            </div>
            <h3 className="text-3xl font-serif font-bold tracking-[0.15em] uppercase text-slate-800">Ordem de Serviço</h3>
            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Higienização de Estofados</p>
          </div>

          <div className="p-10 space-y-10">
            {/* Cliente */}
            <section>
              <h4 className="flex items-center gap-3 text-base font-serif font-bold text-slate-700 uppercase mb-6 border-l-4 border-gold pl-4">
                <User size={20} className="text-gold" /> Identificação do Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nome Completo</label>
                  <input type="text" name="clientName" value={formData.clientName} onChange={handleInputChange}
                    className="w-full border border-slate-200 focus:border-gold outline-none py-2.5 px-4 text-base font-medium transition-colors bg-white rounded-lg text-slate-800"
                    placeholder="Ex: Sr. João Silva" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contato</label>
                  <div className="flex items-center gap-2 border border-slate-200 focus-within:border-gold transition-colors rounded-lg px-4">
                    <Phone size={16} className="text-slate-400" />
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                      className="w-full outline-none py-2.5 text-base font-medium bg-transparent text-slate-800"
                      placeholder="(00) 00000-0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data do Serviço</label>
                  <div className="flex items-center gap-2 border border-slate-200 focus-within:border-gold transition-colors rounded-lg px-4">
                    <Calendar size={16} className="text-slate-400" />
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange}
                      className="w-full outline-none py-2.5 text-base font-medium bg-transparent text-slate-800" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Modalidade de Serviço</label>
                  <select name="serviceType" value={formData.serviceType} onChange={handleInputChange}
                    className="w-full border border-slate-200 focus:border-gold outline-none py-2.5 px-4 text-base font-medium bg-white cursor-pointer rounded-lg text-slate-800">
                    <option value="Higienização">Higienização Técnica</option>
                    <option value="Impermeabilização">Blindagem Nanotecnológica</option>
                    <option value="Ambos">Higienização + Blindagem</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Laudo Técnico */}
            <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <h4 className="flex items-center gap-3 text-base font-serif font-bold text-slate-700 uppercase mb-8 border-l-4 border-gold pl-4">
                <Info size={20} className="text-gold" /> Laudo Técnico Preliminar
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Composição Têxtil</label>
                  <div className="grid grid-cols-2 gap-4">
                    {FABRIC_OPTIONS.map((fabric) => (
                      <label key={fabric} className="flex items-center gap-3 cursor-pointer group py-1">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${formData.fabrics.includes(fabric) ? 'border-gold bg-gold' : 'border-slate-300 bg-white'}`}>
                          {formData.fabrics.includes(fabric) && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                        </div>
                        <input type="checkbox" checked={formData.fabrics.includes(fabric)} onChange={() => toggleArrayItem('fabrics', fabric)} className="hidden" />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-gold transition-colors">{fabric}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">Nível de Contaminação</label>
                  <div className="flex h-10 w-full rounded-lg overflow-hidden border border-slate-200 bg-white p-1">
                    {(['Leve', 'Moderado', 'Intenso'] as DirtLevel[]).map((level) => (
                      <button key={level} type="button"
                        onClick={() => setFormData((p) => ({ ...p, dirtLevel: level }))}
                        className={`flex-1 rounded-full transition-all ${formData.dirtLevel === level ? level === 'Intenso' ? 'bg-midnight text-white' : 'bg-gold text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{level}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Condição Estrutural</label>
                  <div className="grid grid-cols-2 gap-4">
                    {CONDITION_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.conditions.includes(opt) ? 'border-gold bg-gold' : 'border-slate-300 bg-white'}`}>
                          {formData.conditions.includes(opt) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input type="checkbox" checked={formData.conditions.includes(opt)} onChange={() => toggleArrayItem('conditions', opt)} className="hidden" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-gold transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Agentes Contaminantes</label>
                  <div className="grid grid-cols-2 gap-4">
                    {DIRT_TYPE_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.dirtTypes.includes(opt) ? 'border-gold bg-gold' : 'border-slate-300 bg-white'}`}>
                          {formData.dirtTypes.includes(opt) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <input type="checkbox" checked={formData.dirtTypes.includes(opt)} onChange={() => toggleArrayItem('dirtTypes', opt)} className="hidden" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-gold transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Observações */}
            <section>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Notas Adicionais e Observações Especiais</label>
              <textarea name="observations" value={formData.observations} onChange={handleInputChange} rows={3}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl focus:border-gold outline-none transition-all resize-none text-slate-800 text-base leading-relaxed"
                placeholder="Descreva aqui detalhes específicos do serviço..." />
            </section>

            {/* Assinaturas e Preço */}
            <section className="border-t border-slate-200 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Responsável Técnico</label>
                  <div className="border border-slate-200 bg-slate-50 rounded-xl h-24 flex flex-col items-center justify-center">
                    <span className="font-signature text-2xl text-slate-800">Fábio Sinhoreli Aguiar</span>
                    <span className="text-[8px] uppercase tracking-widest text-gold mt-1 font-bold">F&E Clean Specialist</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Assinatura do Cliente</label>
                  <div className="border border-slate-200 bg-slate-50 rounded-xl overflow-hidden">
                    <SignatureCanvas ref={clientSigRef} penColor="#1e293b"
                      canvasProps={{ className: 'w-full h-24 cursor-crosshair' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Investimento</label>
                  <div className="bg-slate-800 text-white p-6 rounded-xl h-24 flex items-center gap-3">
                    <span className="text-xl font-serif font-bold text-gold">R$</span>
                    <input type="text" name="price" value={formData.price} onChange={handleInputChange}
                      className="w-full bg-transparent border-b border-white/20 focus:border-gold outline-none text-3xl font-serif font-bold transition-colors"
                      placeholder="0,00" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer do documento */}
          <div className="px-10 py-6 bg-slate-50 border-t border-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-6 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-gold" /> Selo de Qualidade F&E Clean</div>
              <div className="flex items-center gap-2"><Droplets size={12} className="text-gold" /> Ativos Biodegradáveis</div>
              <div className="flex items-center gap-2"><Wind size={12} className="text-gold" /> Secagem Inteligente</div>
              <div className="flex items-center gap-2 text-slate-500"><Phone size={12} className="text-gold" /> (16) 920047362</div>
              <div className="flex items-center gap-2 text-slate-500"><Instagram size={12} className="text-gold" /> @feclean1</div>
            </div>
          </div>
        </motion.div>

        {/* FAB Mobile */}
        <div className="fixed bottom-10 right-10 no-print md:hidden z-50">
          <button onClick={generatePDF} disabled={isGenerating}
            className="w-16 h-16 bg-gold text-white rounded-full shadow-3xl flex items-center justify-center hover:bg-gold-light transition-all active:scale-95">
            {isGenerating
              ? <span className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              : <Download size={28} />}
          </button>
        </div>
      </div>

      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.5; filter: invert(0.5); }
        ::selection { background: #0891b2; color: white; }
      `}</style>
    </div>
  );
}
