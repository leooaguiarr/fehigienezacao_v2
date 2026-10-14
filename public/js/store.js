// Camada de dados da F&E Clean.
//
// A interface só chama criar/atualizar/remover/gravarLote e escuta aoMudar().
// Os dados ficam no Firestore, em usuarios/{EMPRESA_UID}/..., e só contas
// Google autorizadas os leem ou gravam (veja firestore.rules).

import { firebaseConfig } from './firebase-config.js';
import { uid } from './utils.js?v=2';

const SDK = 'https://www.gstatic.com/firebasejs/12.9.0';
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
  // 'carregando' | 'deslogado' | 'sem-acesso' | 'nuvem'
  modo: 'carregando',
  usuario: null,
  empresaUid: EMPRESA_UID,
  state: estadoVazio(),
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
  'permission-denied': 'Sem permissão para esta ação.',
  'unavailable': 'Sem conexão com o Firestore. Tentaremos novamente.',
  'failed-precondition': 'O Firestore ainda não foi criado no console do Firebase.',
  'not-found': 'Registro não encontrado. Ele pode ter sido removido.'
};
export function mensagemErro(error) {
  const codigo = String((error && error.code) || '');
  if (ERROS[codigo]) return ERROS[codigo];
  // O SDK devolve mensagens como "Firebase: Error (auth/algo-assim)." Sem
  // tradução própria, ao menos mostramos o código sem o ruído em volta.
  if (codigo) return `Falha no Firebase (${codigo}).`;
  return (error && error.message) || 'Não foi possível concluir a operação.';
}

/* -------------------------------------------------------------- Sessão -- */

export function aoMudar(callback) { notificar = callback; }
export function aoErro(callback) { notificarErro = callback; }

function limparSessao(modo) {
  pararEscuta();
  store.modo = modo;
  store.state = estadoVazio();
  try { localStorage.removeItem(MODO_KEY); } catch {}
}

// Observa o login e decide o que mostrar na abertura do app.
export async function iniciar() {
  // Remove rastros de versões antigas (modo demonstração e login por senha).
  try {
    ['feclean-gestao-v1', 'hiper-gestao-v1', 'feclean-auth-team'].forEach(chave => localStorage.removeItem(chave));
    if (localStorage.getItem(MODO_KEY) === 'demo') localStorage.removeItem(MODO_KEY);
  } catch {}

  const { auth, authApi } = await carregarSDK();
  authApi.onAuthStateChanged(auth, async usuario => {
    if (!usuario) {
      store.usuario = null;
      limparSessao('deslogado');
      notificar();
      return;
    }
    store.usuario = usuario;
    let liberado = false;
    try {
      liberado = await verificarAutorizacao(usuario.email);
    } catch (error) {
      console.error('Erro na validação de autorização:', error);
      notificarErro(mensagemErro(error));
    }
    if (!liberado) {
      limparSessao('sem-acesso');
      notificar();
      return;
    }
    store.modo = 'nuvem';
    try { localStorage.setItem(MODO_KEY, 'nuvem'); } catch {}
    await escutarColecoes();
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

// Contas com acesso permanente. A mesma lista existe em firestore.rules, que
// é quem de fato garante o acesso: mantenha as duas iguais.
const AUTORIZADOS_MESTRES = [
  'feclean.higienizacao@gmail.com',
  'leooaguiarr@gmail.com'
];

export const ehMestre = email => AUTORIZADOS_MESTRES.includes(String(email || '').trim().toLowerCase());

// Autenticar no Google não é o mesmo que ter acesso ao sistema: além das
// contas mestre, a liberação vem da lista Firestore `autorizados/{email}`.
async function verificarAutorizacao(email) {
  if (!email) return false;
  const emailNorm = String(email).trim().toLowerCase();
  if (ehMestre(emailNorm)) return true;

  try {
    const { db, dbApi } = await carregarSDK();
    const registro = await dbApi.getDoc(dbApi.doc(db, 'autorizados', emailNorm));
    return registro.exists() && (registro.data() || {}).ativo !== false;
  } catch (err) {
    console.warn('Erro ao consultar lista de autorizados no Firestore:', err);
    return false;
  }
}

export async function listarAutorizados() {
  const { db, dbApi } = await carregarSDK();
  const snapshot = await dbApi.getDocs(dbApi.collection(db, 'autorizados'));
  const mapa = new Map();

  AUTORIZADOS_MESTRES.forEach(email => {
    mapa.set(email, { email, nome: 'Administrador Principal', ativo: true, mestre: true });
  });

  snapshot.forEach(docSnap => {
    const data = docSnap.data() || {};
    const email = docSnap.id.toLowerCase();
    mapa.set(email, {
      ...data,
      email,
      nome: data.nome || 'Membro da Equipe',
      ativo: data.ativo !== false,
      mestre: ehMestre(email)
    });
  });

  return Array.from(mapa.values());
}

export async function adicionarAutorizado(email, nome = '') {
  if (!email) throw new Error('E-mail é obrigatório.');
  const emailNorm = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    throw new Error('E-mail inválido.');
  }
  const { db, dbApi } = await carregarSDK();
  await dbApi.setDoc(dbApi.doc(db, 'autorizados', emailNorm), {
    email: emailNorm,
    nome: String(nome).trim().slice(0, 80) || 'Membro da Equipe',
    ativo: true,
    cadastradoEm: new Date().toISOString()
  }, { merge: true });
}

export async function removerAutorizado(email) {
  if (!email) return;
  const emailNorm = String(email).trim().toLowerCase();
  if (ehMestre(emailNorm)) {
    throw new Error('Não é possível remover a conta de administrador mestre.');
  }
  const { db, dbApi } = await carregarSDK();
  await dbApi.deleteDoc(dbApi.doc(db, 'autorizados', emailNorm));
}

export async function sair() {
  store.usuario = null;
  limparSessao('deslogado');
  if (fb?.authApi && fb?.auth) {
    await fb.authApi.signOut(fb.auth).catch(() => {});
  }
  notificar();
}

/* ------------------------------------------------------------- Leitura -- */

function pararEscuta() { ouvintes.forEach(cancelar => cancelar()); ouvintes = []; }

// Assina as coleções da empresa. Todas as contas liberadas usam o mesmo
// caminho; as regras do Firestore decidem quem pode ler.
async function escutarColecoes() {
  pararEscuta();
  const { db, dbApi } = await carregarSDK();
  store.state = estadoVazio();
  const cacheDe = {};
  const pendentesDe = {};
  Object.entries(COLECOES).forEach(([chave, nome]) => {
    const referencia = dbApi.collection(db, 'usuarios', EMPRESA_UID, nome);
    const cancelar = dbApi.onSnapshot(referencia, { includeMetadataChanges: true }, snapshot => {
      store.state[chave] = snapshot.docs.map(documento => ({ id: documento.id, ...documento.data() }));
      cacheDe[chave] = snapshot.metadata.fromCache;
      pendentesDe[chave] = snapshot.metadata.hasPendingWrites;
      store.doCache = Object.values(cacheDe).some(Boolean);
      store.pendentes = Object.values(pendentesDe).some(Boolean);
      notificar();
    }, error => notificarErro(mensagemErro(error)));
    ouvintes.push(cancelar);
  });
}

/* ------------------------------------------------------------- Escrita -- */

// O Firestore rejeita campos com valor undefined; eles são descartados aqui.
function semIndefinidos(dados) {
  return Object.fromEntries(Object.entries(dados).filter(([, valor]) => valor !== undefined));
}

async function referenciaDoc(chave, id) {
  const { db, dbApi } = await carregarSDK();
  return dbApi.doc(db, 'usuarios', EMPRESA_UID, COLECOES[chave], id);
}

export async function criar(chave, dados) {
  const registro = { id: dados.id || uid(chave.slice(0, 3)), ...dados };
  const { id, ...corpo } = registro;
  const referencia = await referenciaDoc(chave, id);
  await fb.dbApi.setDoc(referencia, semIndefinidos(corpo));
  return registro;
}

export async function atualizar(chave, id, patch) {
  const referencia = await referenciaDoc(chave, id);
  await fb.dbApi.updateDoc(referencia, semIndefinidos(patch));
}

export async function remover(chave, id) {
  const referencia = await referenciaDoc(chave, id);
  await fb.dbApi.deleteDoc(referencia);
}

// Grava várias operações de uma vez (usado ao concluir uma OS, que atualiza o
// agendamento, o cliente e cria a receita no mesmo gesto).
export async function gravarLote(operacoes) {
  const { db, dbApi } = await carregarSDK();
  const lote = dbApi.writeBatch(db);
  for (const { tipo, chave, id, dados } of operacoes) {
    const referencia = await referenciaDoc(chave, id);
    if (tipo === 'criar') { const { id: _descartado, ...corpo } = dados; lote.set(referencia, semIndefinidos(corpo)); }
    else if (tipo === 'atualizar') lote.update(referencia, semIndefinidos(dados));
    else if (tipo === 'remover') lote.delete(referencia);
  }
  await lote.commit();
}
