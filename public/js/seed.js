// Dados demonstrativos e catálogo padrão de serviços.
//
// SERVICOS_PADRAO também é usado no primeiro acesso de uma conta nova na
// nuvem, para que a agenda já nasça com o catálogo da Hiper cadastrado.

import { localISO, addDays } from './utils.js';

export const SERVICOS_PADRAO = [
{ id:'svc-sofa', name:'Higienização de sofá', icon:'sofa', duration:180, basePrice:280, active:true, description:'Limpeza profunda, remoção de ácaros, odores e sujeiras sem agredir o tecido.' },
{ id:'svc-chair', name:'Higienização de cadeiras', icon:'chair', duration:120, basePrice:160, active:true, description:'Tratamento para conjuntos residenciais e corporativos, com recuperação de cor e toque.' },
{ id:'svc-mattress', name:'Higienização de colchão', icon:'mattress', duration:120, basePrice:220, active:true, description:'Redução de ácaros, manchas e odores para um ambiente de descanso mais saudável.' },
{ id:'svc-rug', name:'Tapetes e carpetes', icon:'rug', duration:180, basePrice:190, active:true, requiresReturn:true, returnDays:7, description:'Processo adequado à fibra para remover sujeira incrustada e preservar a maciez.' },
{ id:'svc-protection', name:'F&E Proteção & Impermeabilização', icon:'shield', duration:150, basePrice:350, active:true, description:'Impermeabilização que dificulta a absorção de líquidos sem alterar cor ou textura.' },
{ id:'svc-pet', name:'Remoção de urina de pet', icon:'pet', duration:150, basePrice:250, active:true, description:'Tratamento técnico de manchas e odores de origem orgânica, seguro para o estofado.' },
{ id:'svc-kids', name:"Higienização infantil", icon:'baby', duration:90, basePrice:140, active:true, description:'Carrinhos, cadeirinhas e itens infantis com produtos seguros e hipoalergênicos.' },
{ id:'svc-business', name:'Atendimento empresarial', icon:'business', duration:240, basePrice:520, active:true, description:'Soluções planejadas para escritórios, clínicas, condomínios e alto volume.' }
];

export function seedData() {
  const services = SERVICOS_PADRAO.map(service => ({ ...service }));
  const clients = [];
  const appointments = [];
  const transactions = [];
  const settings = [
    {
      id: 'empresa',
      msgConfirmacao: 'Olá {{cliente}}! Aqui é da F&E Clean. Passando para confirmar nosso agendamento de {{servico}} para o dia {{data}} às {{hora}}. Tudo certo para o atendimento?',
      msgGarantia: 'Olá {{cliente}}! Seu serviço de {{servico}} foi concluído pela F&E Clean com sucesso!\n\n✨ *Orientações de Cuidado & Secagem:*\nDeixe o estofado secando em local ventilado por 4 a 8 horas. Evite sentar ou cobrir durante a secagem.\nQualquer dúvida, estamos à disposição!\nObrigado pela confiança na F&E Clean!',
      msgLembrete: 'Olá {{cliente}}! Como você está?\nAqui é da F&E Clean. Já faz um tempinho desde a última higienização do seu estofado. Que tal agendar uma nova higienização para manter sua casa limpa, cheirosa e livre de ácaros?'
    }
  ];
  return { services, clients, appointments, transactions, settings };
}
