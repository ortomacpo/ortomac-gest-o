import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore } from "firebase/firestore";

// Tenta obter as variáveis de todas as formas que o Vite e a Vercel permitem
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || (import.meta as any).env.FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta as any).env.FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || (import.meta as any).env.FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || (import.meta as any).env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || (import.meta as any).env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || (import.meta as any).env.FIREBASE_APP_ID || ""
};

// Verifica se a API Key existe de fato e não é apenas um texto vazio ou "undefined"
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
    console.log("🔥 Firebase conectado com sucesso!");
  } catch (err) {
    console.error("Erro ao inicializar Firebase:", err);
  }
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  
  const q = query(collection(db, collectionName));
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    // Ordenação simples no cliente (mais recentes primeiro)
    const sorted = data.sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    callback(sorted);
  }, (error) => {
    console.error(`Erro na coleção ${collectionName}:`, error);
  });
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    alert("Atenção: Sistema em Modo Offline. Verifique as chaves na Vercel.");
    return;
  }
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef;
  } catch (e) {
    console.error("Erro ao salvar:", e);
    alert("Falha ao salvar na nuvem. Verifique sua conexão.");
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