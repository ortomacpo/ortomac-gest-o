import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, Firestore, getDocs, limit, query } from "firebase/firestore";

// Mapeamento das variáveis vindas da Vercel através do Vite
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.ID_DO_PROJETO_FIREBASE,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE,
  appId: process.env.ID_DO_APLICATIVO_FIREBASE
};

// RELATÓRIO DE CONEXÃO DETALHADO
console.group("🔍 Diagnóstico Ortomac Connection");
console.log("Projeto ID:", firebaseConfig.projectId || "❌ AUSENTE");
console.log("Configuração Completa:", !!(firebaseConfig.apiKey && firebaseConfig.projectId) ? "✅ OK" : "❌ INCOMPLETA");
console.groupEnd();

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey.length > 10
);

export const getEnvStatus = () => ({
  apiKey: !!firebaseConfig.apiKey,
  projectId: !!firebaseConfig.projectId,
  appId: !!firebaseConfig.appId,
  geminiKey: !!process.env.API_KEY
});

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🚀 Firebase inicializado com sucesso.");
  } catch (err) {
    console.error("🔥 Erro ao inicializar Firebase:", err);
  }
}

export { db };

// Função para testar se as regras do Firestore estão realmente funcionando
export const testFirestoreConnection = async () => {
  if (!db) return false;
  try {
    const q = query(collection(db, 'patients'), limit(1));
    await getDocs(q);
    return true;
  } catch (e) {
    console.error("❌ Erro de Permissão/Conexão no Firestore:", e);
    return false;
  }
};

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  try {
    const q = collection(db, collectionName);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (err) => {
      console.error(`❌ Erro na coleção ${collectionName}:`, err.message);
    });
  } catch (e) {
    return () => {};
  }
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) return;
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: new Date().toISOString() });
};