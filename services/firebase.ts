import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, Firestore } from "firebase/firestore";

// Mapeamento inteligente para aceitar os nomes da imagem do usuário
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.ID_DO_PROJETO_FIREBASE || "",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE || "",
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.ID_DO_APLICATIVO_FIREBASE || ""
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 10
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Conectado à Nuvem com as chaves customizadas");
  } catch (err) {
    console.error("❌ Erro ao inicializar Firebase:", err);
  }
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = collection(db, collectionName);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (err) => console.error(`Erro em ${collectionName}:`, err));
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    alert("Erro: Banco de dados não conectado. Verifique o diagnóstico no topo.");
    return;
  }
  return await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString()
  });
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: new Date().toISOString() });
};