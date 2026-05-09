import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDiXy4uSqus41pPa1817ZoQG2KmXSFwVMY",
  authDomain: "fehizienizacao.firebaseapp.com",
  projectId: "fehizienizacao",
  storageBucket: "fehizienizacao.firebasestorage.app",
  messagingSenderId: "212072636994",
  appId: "1:212072636994:web:5095eb49196737c89683db",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
