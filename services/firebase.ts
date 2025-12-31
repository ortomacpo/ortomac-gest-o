
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || ""
};

// Verifica se a configuração é válida (não vazia e não é o placeholder)
export const isFirebaseConfigured = 
  firebaseConfig.apiKey !== "" && 
  !firebaseConfig.apiKey.includes("AIzaSy");

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Ortomac: Conectado ao Firebase Cloud.");
  } catch (err) {
    console.error("Erro ao inicializar Firebase:", err);
  }
} else {
  console.warn("Ortomac: Rodando em modo de PREVIEW (Sem chaves Firebase configuradas).");
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {}; // Retorna função vazia se o banco não estiver ativo

  try {
    const q = query(collection(db, collectionName));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.warn(`Erro de sincronização em ${collectionName}:`, error.message);
    });
  } catch (err) {
    console.error(`Falha na coleção ${collectionName}:`, err);
    return () => {};
  }
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) {
    console.warn("Ação ignorada: Firebase não configurado.");
    return;
  }
  return await addDoc(collection(db, collectionName), data);
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) {
    console.warn("Ação ignorada: Firebase não configurado.");
    return;
  }
  const docRef = doc(db, collectionName, id);
  return await updateDoc(docRef, data);
};
