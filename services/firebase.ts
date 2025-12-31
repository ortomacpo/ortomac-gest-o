import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Verificação rigorosa se as chaves existem
export const isFirebaseConfigured = 
  !!firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "undefined" && 
  firebaseConfig.apiKey.length > 10;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Conectado à Nuvem Ortomac");
  } catch (err) {
    console.error("❌ Erro fatal ao conectar na nuvem:", err);
  }
} else {
  console.warn("⚠️ Ambiente de Nuvem não detectado. Usando modo de demonstração local.");
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  
  // Adicionado ordenação por data de criação para manter consistência entre usuários
  const q = query(collection(db, collectionName));
  
  return onSnapshot(q, 
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      console.log(`[Sync] ${collectionName} atualizado: ${data.length} registros.`);
      callback(data);
    },
    (error) => {
      console.error(`[Sync Error] Falha na coleção ${collectionName}:`, error);
    }
  );
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    console.error("Tentativa de escrita offline bloqueada.");
    return;
  }
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date().toISOString(),
      serverTimestamp: new Date().getTime()
    });
    console.log(`[Cloud] Sucesso: ${collectionName} -> ${docRef.id}`);
    return docRef;
  } catch (e) {
    console.error("[Cloud Error] Falha ao salvar:", e);
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
    console.error("[Cloud Error] Falha ao atualizar:", e);
    throw e;
  }
};