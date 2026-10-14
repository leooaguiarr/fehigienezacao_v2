// Grava a mensagem do formulário "Fale conosco" no Firestore.
//
// O SDK do Firebase só é baixado no envio: quem apenas navega pela landing
// page não paga o custo de ~300 KB de JavaScript.
//
// A chave abaixo não é segredo: identifica o projeto. Quem protege os dados
// são as regras em firestore.rules.

const firebaseConfig = {
  apiKey: 'AIzaSyDiXy4uSqus41pPa1817ZoQG2KmXSFwVMY',
  authDomain: 'fehizienizacao.firebaseapp.com',
  projectId: 'fehizienizacao',
  storageBucket: 'fehizienizacao.firebasestorage.app',
  messagingSenderId: '212072636994',
  appId: '1:212072636994:web:5095eb49196737c89683db',
};

export interface MensagemContato {
  name: string;
  phone: string;
  neighborhood: string;
  message: string;
}

export async function salvarMensagemContato(mensagem: MensagemContato): Promise<void> {
  const [{ initializeApp, getApps }, { getFirestore, collection, addDoc, serverTimestamp }] = await Promise.all([
    import('firebase/app'),
    import('firebase/firestore/lite'),
  ]);
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  await addDoc(collection(getFirestore(app), 'contact_messages'), {
    ...mensagem,
    createdAt: serverTimestamp(),
  });
}
