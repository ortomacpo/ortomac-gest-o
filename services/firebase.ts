import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, Firestore, getDocs, limit, query, writeBatch } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.ID_DO_PROJETO_FIREBASE,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE,
  appId: process.env.ID_DO_APLICATIVO_FIREBASE
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "undefined"
);

export const getEnvStatus = () => ({
  apiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined",
  projectId: firebaseConfig.projectId === "undefined" ? null : firebaseConfig.projectId,
  appId: !!firebaseConfig.appId && firebaseConfig.appId !== "undefined",
  geminiKey: !!process.env.API_KEY && process.env.API_KEY !== "undefined"
});

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (err) {
    console.error("🔥 Erro Firebase:", err);
  }
}

export { db };

export const testFirestoreConnection = async () => {
  if (!db) return false;
  try {
    const q = query(collection(db, 'patients'), limit(1));
    await getDocs(q);
    return true;
  } catch (e) {
    return false;
  }
};

export const seedDatabase = async (initialData: any) => {
  if (!db) return { success: false, message: "Firebase não configurado" };
  try {
    // Verifica se já existem pacientes para evitar duplicidade acidental
    const snapshot = await getDocs(query(collection(db, 'patients'), limit(1)));
    if (!snapshot.empty) return { success: false, message: "O banco já contém dados." };

    const batch = writeBatch(db);
    
    // Popular coleções básicas
    for (const p of initialData.patients) {
      const ref = doc(collection(db, 'patients'));
      batch.set(ref, p);
    }
    
    for (const i of initialData.inventory) {
      const ref = doc(collection(db, 'inventory'));
      batch.set(ref, i);
    }

    await batch.commit();
    return { success: true, message: "Dados sincronizados com sucesso!" };
  } catch (e: any) {
    return { success: false, message: e.message };
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
      console.error(`❌ Erro ${collectionName}:`, err.message);
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