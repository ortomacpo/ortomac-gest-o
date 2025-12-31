import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Ortomac Cloud: Conectado com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao inicializar Firebase:", err);
  }
} else {
  console.warn("☁️ Ortomac Cloud: Variáveis de ambiente não encontradas. Verifique as configurações na Vercel.");
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) {
    console.warn(`Tentativa de inscrição em ${collectionName} sem banco de dados.`);
    return () => {};
  }
  
  const q = query(collection(db, collectionName));
  return onSnapshot(q, 
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`📡 Atualização recebida [${collectionName}]:`, data.length, "itens");
      callback(data);
    },
    (error) => {
      console.error(`Erro na inscrição da coleção ${collectionName}:`, error);
    }
  );
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    alert("Erro: Sistema em modo offline. O dado não foi salvo na nuvem.");
    return;
  }
  try {
    return await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Erro ao salvar:", e);
    throw e;
  }
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  try {
    return await updateDoc(doc(db, collectionName, id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Erro ao atualizar:", e);
    throw e;
  }
};