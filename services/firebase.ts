import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore } from "firebase/firestore";

// Função para buscar variáveis de ambiente em qualquer contexto (Vercel, Local, Vite)
const getEnv = (key: string): string => {
  // Tenta várias combinações comuns
  const value = 
    (import.meta as any).env?.[`VITE_${key}`] || 
    (import.meta as any).env?.[key] || 
    (window as any).process?.env?.[`VITE_${key}`] ||
    (window as any).process?.env?.[key] || 
    "";
  
  return String(value).trim();
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID')
};

// Verifica se a configuração é válida (mínimo de caracteres para uma API Key)
export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 15 && 
  firebaseConfig.apiKey !== "undefined";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ ORTOMAC CLOUD: Conexão estabelecida.");
  } catch (err) {
    console.error("❌ ERRO FIREBASE INIT:", err);
  }
} else {
  console.error("⚠️ FIREBASE NÃO CONFIGURADO: Verifique as variáveis de ambiente na Vercel.");
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  
  const q = query(collection(db, collectionName));
  
  return onSnapshot(q, 
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      // Ordenação no cliente para garantir que o mais novo apareça primeiro
      const sorted = data.sort((a: any, b: any) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      callback(sorted);
    },
    (error) => {
      console.error(`Erro ao ler ${collectionName}:`, error);
    }
  );
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    const msg = "ERRO: Banco de dados não conectado. Verifique as chaves na Vercel.";
    alert(msg);
    throw new Error(msg);
  }

  try {
    const cleanData = {
      ...data,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    console.log(`Tentando salvar em [${collectionName}]...`, cleanData);
    const docRef = await addDoc(collection(db, collectionName), cleanData);
    console.log(`✅ Salvo com sucesso! ID: ${docRef.id}`);
    return docRef;
  } catch (e: any) {
    console.error("❌ ERRO AO SALVAR:", e);
    alert(`Erro ao salvar: ${e.message || "Erro desconhecido"}`);
    throw e;
  }
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  try {
    await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Erro ao atualizar:", e);
    throw e;
  }
};