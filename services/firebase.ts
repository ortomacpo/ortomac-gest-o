import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore } from "firebase/firestore";

// Função para tentar capturar a chave de qualquer lugar (Vite, Process ou Window)
const getSafeEnv = (key: string): string => {
  const viteKey = `VITE_FIREBASE_${key}`;
  const rawKey = `FIREBASE_${key}`;
  
  return (
    (import.meta as any).env?.[viteKey] || 
    (import.meta as any).env?.[rawKey] || 
    (window as any).process?.env?.[viteKey] ||
    (window as any).process?.env?.[rawKey] ||
    ""
  ).trim();
};

const firebaseConfig = {
  apiKey: getSafeEnv('API_KEY'),
  authDomain: getSafeEnv('AUTH_DOMAIN'),
  projectId: getSafeEnv('PROJECT_ID'),
  storageBucket: getSafeEnv('STORAGE_BUCKET'),
  messagingSenderId: getSafeEnv('MESSAGING_SENDER_ID'),
  appId: getSafeEnv('APP_ID')
};

// Debug para o desenvolvedor (visível no F12)
console.log("🔍 Verificando Configuração Firebase...");
if (!firebaseConfig.apiKey) {
  console.warn("⚠️ API_KEY não encontrada. Verifique as variáveis de ambiente na Vercel.");
}

export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 10 && 
  firebaseConfig.apiKey !== "undefined";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ ORTOMAC CLOUD: Conectado.");
  } catch (err) {
    console.error("❌ Erro ao conectar Firebase:", err);
  }
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = collection(db, collectionName);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
  }, (err) => console.error(`Erro em ${collectionName}:`, err));
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    alert("Erro: Banco de dados não inicializado.");
    return;
  }
  try {
    return await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Erro addDoc:", e);
    alert("Falha ao salvar. Verifique sua conexão ou permissões.");
    throw e;
  }
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  try {
    await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("Erro updateDoc:", e);
    throw e;
  }
};