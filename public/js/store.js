// Camada de dados da Hiper Higienizações.
//
// Opera em dois modos, expostos pela mesma API para a interface:
//
//   'demo'  - dados demonstrativos guardados em localStorage, sem login.
//   'nuvem' - dados compartilhados da Hiper no Firestore, em tempo real.
//
// Em ambos os modos a interface só chama criar/atualizar/remover e escuta
// aoMudar(). O SDK do Firebase é carregado sob demanda: em modo demonstração
// nenhuma requisição ao Firebase acontece.

import { firebaseConfig, configPendente } from './firebase-config.js';
import { seedData, SERVICOS_PADRAO } from './seed.js';
import { uid } from './utils.js';

const SDK = 'https://www.gstatic.com/firebasejs/12.9.0';
const STORAGE_KEY = 'feclean-gestao-v1';
const MODO_KEY = 'feclean-modo';
export const EMPRESA_UID = 'feclean-oficial';

// Chaves do estado em memória -> nomes das coleções no Firestore.
const COLECOES = {
  services: 'servicos',
  clients: 'clientes',
  appointments: 'agendamentos',
  transactions: 'lancamentos',
  settings: 'configuracoes'
};

const estadoVazio = () => ({ services: [], clients: [], appointments: [], transactions: [], settings: [] });

let fb = null;
let ouvintes = [];
let notificar = () => {};
let notificarErro = () => {};

export const store = {
  modo: 'carregando',
  usuario: null,
  empresaUid: EMPRESA_UID,
  state: estadoVazio(),
  configPendente,
  // Sincronização: 'doCache' indica que os dados vieram do cache local e
  // 'pendentes' que há gravações ainda não confirmadas pelo servidor.
  doCache: false,
  pendentes: false
};

/* ------------------------------------------------------------------ SDK -- */

async function carregarSDK() {
  if (fb) return fb;
  const [appMod, authMod, dbMod] = await Promise.all([
    import(SDK + '/firebase-app.js'),
    import(SDK + '/firebase-auth.js'),
    import(SDK + '/firebase-firestore.js')
  ]);
  const app = appMod.initializeApp(firebaseConfig);

  // Cache local persistente: a equipe abre a agenda, consulta o cliente e
  // conclui a OS sem sinal; as gravações ficam na fila e sobem sozinhas
  // quando a conexão volta. O gerenciador de múltiplas abas evita conflito
  // entre o app no celular e o navegador aberto no computador.
  let db;
  try {
    db = dbMod.initializeFirestore(app, {
      localCache: dbMod.persistentLocalCache({ tabManager: dbMod.persistentMultipleTabManager() })
    });
  } catch {
    // Navegador sem IndexedDB (ou aba anônima): segue online, sem cache.
    db = dbMod.getFirestore(app);
  }

  fb = { auth: authMod.getAuth(app), db, authApi: authMod, dbApi: dbMod };
  return fb;
}

const ERROS = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'Não foi possível validar esta conta Google.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/operation-not-allowed': 'Ative o login com Google no console do Firebase.',
  'auth/configuration-not-found': 'Ative o login com Google no console do Firebase.',
  'auth/unauthorized-domain': 'Domínio não autorizado no Firebase Authentication.',
  'auth/user-disabled': 'Esta conta está desativada.',
  'auth/popup-closed-by-user': 'Login cancelado.',
  'auth/cancelled-popup-request': 'Login cancelado.',
  'auth/popup-blocked': 'O navegador bloqueou a janela de login.',
  'auth/account-exists-with-different-credential': 'Este e-mail já entrou por outro método.',
  'auth/requires-recent-login': 'Por segurança, entre novamente para concluir.',
  'auth/invalid-api-key': 'Chave de API inválida. Revise o firebase-config.js.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Chave de API inválida. Revise o firebase-config.js.',
  'permission-denied': 'Sem permissão para este dado. Confira as regras do Firestore.',
  'unavailable': 'Sem conexão com o Firestore. Tentaremos novamente.',
  'failed-precondition': 'O Firestore ainda não foi criado no console do Firebase.',
  'not-found': 'Registro não encontrado. Ele pode ter sido removido.'
};
export function mensagemErro(error) {
  const codigo = String((error && error.code) || '');
  if (ERROS[codigo]) return ERROS[codigo];
  // O SDK devolve mensagens como "Firebase: Error (auth/algo-assim)." Sem
  // tradução própria, ao menos mostramos o código sem o ruído em volta.
  const bruta = (error && error.message) || '';
  if (codigo) return `Falha no Firebase (${codigo}). Confira docs/FIREBASE_SETUP.md.`;
  return bruta || 'Não foi possível concluir a operação.';
}

/* -------------------------------------------------------------- Sessão -- */

export function aoMudar(callback) { notificar = callback; }
export function aoErro(callback) { notificarErro = callback; }

// Observa o login e decide o modo de operação na abertura do app.
export async function iniciar() {
  // Limpeza de rastros de demonstração antigos e autenticações legadas por senha
  try {
    localStorage.removeItem('feclean-gestao-v1');
    localStorage.removeItem('hiper-gestao-v1');
    localStorage.removeItem('feclean-auth-team');
    if (localStorage.getItem(MODO_KEY) === 'demo') {
      localStorage.removeItem(MODO_KEY);
    }
  } catch {}

  const { auth, authApi } = await carregarSDK();
  authApi.onAuthStateChanged(auth, async usuario => {
    if (usuario) {
      store.usuario = usuario;
      let liberado = false;
      try {
        liberado = await verificarAutorizacao(usuario.email);
      } catch (error) {
        console.error('Erro na validação de autorização:', error);
        notificarErro(mensagemErro(error));
      }
      if (!liberado) {
        pararEscuta();
        store.modo = 'sem-acesso';
        store.state = estadoVazio();
        localStorage.removeItem(MODO_KEY);
        notificar();
        return;
      }
      store.modo = 'nuvem';
      localStorage.setItem(MODO_KEY, 'nuvem');
      await escutarColecoes();
    } else {
      pararEscuta();
      store.usuario = null;
      store.modo = 'deslogado';
      store.state = estadoVazio();
      localStorage.removeItem(MODO_KEY);
    }
    notificar();
  });
}

export async function entrarComGoogle() {
  const { auth, authApi } = await carregarSDK();
  const provedor = new authApi.GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: 'select_account' });
  try {
    await authApi.signInWithPopup(auth, provedor);
  } catch (error) {
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
      await authApi.signInWithRedirect(auth, provedor);
      return;
    }
    throw error;
  }
}

// Lista mestre com permissão irrestrita permanente
const AUTORIZADOS_MESTRES = [
  'feclean.higienizacao@gmail.com',
  'leooaguiarr@gmail.com'
];

// Autenticar no Google não é o mesmo que ter acesso ao sistema:
// a liberação vem exclusivamente da lista Firestore `autorizados/{email}`.
async function verificarAutorizacao(email) {
  if (!email) return false;
  const emailNorm = String(email).trim().toLowerCase();

  // Contas mestre sempre autorizadas
  if (AUTORIZADOS_MESTRES.includes(emailNorm)) return true;

  try {
    const { db, dbApi } = await carregarSDK();
    const registro = await dbApi.getDoc(dbApi.doc(db, 'autorizados', emailNorm));
    if (registro.exists()) {
      const dados = registro.data() || {};
      if (dados.ativo === false) return false;
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Erro ao consultar lista de autorizados no Firestore:', err);
    return false;
  }
}

export async function listarAutorizados() {
  const { db, dbApi } = await carregarSDK();
  const snapshot = await dbApi.getDocs(dbApi.collection(db, 'autorizados'));
  const mapa = new Map();

  // Inclui as contas mestres por padrão
  AUTORIZADOS_MESTRES.forEach(email => {
    mapa.set(email, { email, nome: 'Administrador Principal', ativo: true, mestre: true });
  });

  snapshot.forEach(docSnap => {
    const data = docSnap.data() || {};
    const email = docSnap.id.toLowerCase();
    mapa.set(email, {
      email,
      nome: data.nome || 'Membro da Equipe',
      ativo: data.ativo !== false,
      mestre: AUTORIZADOS_MESTRES.includes(email),
      ...data
    });
  });

  return Array.from(mapa.values());
}

export async function adicionarAutorizado(email, nome = '') {
  if (!email) throw new Error('E-mail é obrigatório.');
  const emailNorm = String(email).trim().toLowerCase();
  if (!emailNorm.includes('@') || !emailNorm.includes('.')) {
    throw new Error('E-mail inválido.');
  }
  const { db, dbApi } = await carregarSDK();
  await dbApi.setDoc(dbApi.doc(db, 'autorizados', emailNorm), {
    email: emailNorm,
    nome: nome.trim() || 'Membro da Equipe',
    ativo: true,
    cadastradoEm: new Date().toISOString()
  }, { merge: true });
}

export async function removerAutorizado(email) {
  if (!email) return;
  const emailNorm = String(email).trim().toLowerCase();
  if (AUTORIZADOS_MESTRES.includes(emailNorm)) {
    throw new Error('Não é possível remover a conta de administrador mestre.');
  }
  const { db, dbApi } = await carregarSDK();
  await dbApi.deleteDoc(dbApi.doc(db, 'autorizados', emailNorm));
}

export async function sair() {
  localStorage.removeItem(MODO_KEY);
  localStorage.removeItem('feclean-auth-team');
  localStorage.removeItem(STORAGE_KEY);
  pararEscuta();
  store.modo = 'deslogado';
  store.usuario = null;
  store.state = estadoVazio();
  if (fb?.authApi && fb?.auth) {
    await fb.authApi.signOut(fb.auth).catch(() => {});
  }
  notificar();
}

export function irParaLogin() {
  localStorage.removeItem(MODO_KEY);
  localStorage.removeItem('feclean-auth-team');
  localStorage.removeItem(STORAGE_KEY);
  pararEscuta();
  store.modo = 'deslogado';
  store.usuario = null;
  store.state = estadoVazio();
  notificar();
}

/* ------------------------------------------------------------- Leitura -- */

function carregarLocal() {
  return estadoVazio();
}
function salvarLocal() {
  // Em produção, os dados vão direto para o Firestore
}

function pararEscuta() { ouvintes.forEach(cancelar => cancelar()); ouvintes = []; }

// Assina as coleções compartilhadas da Hiper. Todas as contas liberadas usam
// o mesmo caminho; o e-mail autorizado determina quem pode acessar a base.
async function escutarColecoes() {
  pararEscuta();
  const { db, dbApi } = await carregarSDK();
  store.state = estadoVazio();
  let semeado = false;
  const cacheDe = {};
  const pendentesDe = {};
  Object.entries(COLECOES).forEach(([chave, nome]) => {
    const referencia = dbApi.collection(db, 'usuarios', EMPRESA_UID, nome);
    const cancelar = dbApi.onSnapshot(referencia, { includeMetadataChanges: true }, async snapshot => {
      store.state[chave] = snapshot.docs.map(documento => ({ id: documento.id, ...documento.data() }));
      cacheDe[chave] = snapshot.metadata.fromCache;
      pendentesDe[chave] = snapshot.metadata.hasPendingWrites;
      store.doCache = Object.values(cacheDe).some(Boolean);
      store.pendentes = Object.values(pendentesDe).some(Boolean);
      // Removemos o auto-seed para permitir que a base fique vazia
      // (caso o usuário exclua todos os serviços para recomeçar).
      notificar();
    }, error => notificarErro(mensagemErro(error)));
    ouvintes.push(cancelar);
  });
}

async function semearServicos() {
  const { db, dbApi } = await carregarSDK();
  const lote = dbApi.writeBatch(db);
  const padrao = seedData();
  
  padrao.services.forEach(servico => {
    const { id, ...dados } = servico;
    lote.set(dbApi.doc(db, 'usuarios', EMPRESA_UID, 'servicos', id), dados);
  });
  
  padrao.settings.forEach(config => {
    const { id, ...dados } = config;
    lote.set(dbApi.doc(db, 'usuarios', EMPRESA_UID, 'configuracoes', id), dados);
  });
  
  await lote.commit();
}

/* ------------------------------------------------------------- Escrita -- */

function referenciaDoc(chave, id) {
  return fb.dbApi.doc(fb.db, 'usuarios', EMPRESA_UID, COLECOES[chave], id);
}

export async function criar(chave, dados) {
  const registro = { id: dados.id || uid(chave.slice(0, 3)), ...dados };
  if (store.modo === 'nuvem') {
    await carregarSDK();
    const { id, ...corpo } = registro;
    await fb.dbApi.setDoc(referenciaDoc(chave, id), corpo);
    return registro;
  }
  store.state[chave].push(registro);
  salvarLocal(); notificar();
  return registro;
}

export async function atualizar(chave, id, patch) {
  if (store.modo === 'nuvem') {
    await carregarSDK();
    await fb.dbApi.updateDoc(referenciaDoc(chave, id), patch);
    return;
  }
  const registro = store.state[chave].find(item => item.id === id);
  if (registro) Object.assign(registro, patch);
  salvarLocal(); notificar();
}

export async function remover(chave, id) {
  if (store.modo === 'nuvem') {
    await carregarSDK();
    await fb.dbApi.deleteDoc(referenciaDoc(chave, id));
    return;
  }
  store.state[chave] = store.state[chave].filter(item => item.id !== id);
  salvarLocal(); notificar();
}

// Grava várias operações de uma vez (usado ao concluir uma OS, que atualiza o
// agendamento, o cliente e cria a receita no mesmo gesto).
export async function gravarLote(operacoes) {
  if (store.modo === 'nuvem') {
    await carregarSDK();
    const lote = fb.dbApi.writeBatch(fb.db);
    operacoes.forEach(({ tipo, chave, id, dados }) => {
      const referencia = referenciaDoc(chave, id);
      if (tipo === 'criar') { const { id: descartado, ...corpo } = dados; lote.set(referencia, corpo); }
      else if (tipo === 'atualizar') lote.update(referencia, dados);
      else if (tipo === 'remover') lote.delete(referencia);
    });
    await lote.commit();
    return;
  }
  operacoes.forEach(({ tipo, chave, id, dados }) => {
    if (tipo === 'criar') store.state[chave].push({ id, ...dados });
    else if (tipo === 'atualizar') {
      const registro = store.state[chave].find(item => item.id === id);
      if (registro) Object.assign(registro, dados);
    } else if (tipo === 'remover') store.state[chave] = store.state[chave].filter(item => item.id !== id);
  });
  salvarLocal(); notificar();
}

export function restaurarDemo() {
  // Desativado em produção
}
