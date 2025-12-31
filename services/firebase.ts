import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore, orderBy } from "firebase/firestore";

// Verificação de múltiplas fontes de variáveis de ambiente
const getEnv = (key: string) => {
  return process.env[key] || (import.meta as any).env?.[`VITE_${key}`] || "";
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID')
};

export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "undefined" && 
  firebaseConfig.apiKey.length > 5;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 CONECTADO AO BANCO DE DADOS REAL");
  } catch (err) {
    console.error("❌ ERRO NA CONEXÃO FIREBASE:", err);
  }
} else {
  console.warn("⚠️ MODO DEMONSTRAÇÃO: As chaves do Firebase não foram encontradas na Vercel.");
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  
  const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, 
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      callback(data);
    },
    (error) => {
      console.error(`Erro ao ler ${collectionName}:`, error);
    }
  );
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    console.error("Impossível salvar: Banco de dados não configurado.");
    alert("ERRO: O sistema não está conectado à nuvem. Seus dados serão perdidos ao atualizar a página. Configure as variáveis na Vercel.");
    return;
  }
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef;
  } catch (e) {
    console.error("Erro ao salvar documento:", e);
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
    console.error("Erro ao atualizar documento:", e);
    throw e;
  }
};