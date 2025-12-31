import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, query, Firestore } from "firebase/firestore";

// Busca as chaves das variáveis de ambiente configuradas na Vercel
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || ""
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "" && firebaseConfig.apiKey !== undefined;

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Ortomac Cloud: Ativo.");
  } catch (err) {
    console.error("Erro Firebase:", err);
  }
}

export { db };

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) return;
  return await addDoc(collection(db, collectionName), data);
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  return await updateDoc(doc(db, collectionName, id), data);
};