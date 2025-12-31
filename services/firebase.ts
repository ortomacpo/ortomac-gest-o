import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, Firestore, getDocs, limit, query, writeBatch } from "firebase/firestore";

// Helper para limpar valores vindos do build process
const getEnv = (key: string | undefined) => {
  if (!key || key === "undefined" || key === "null" || key === "") return undefined;
  return key;
};

const firebaseConfig = {
  apiKey: getEnv(process.env.FIREBASE_API_KEY),
  authDomain: getEnv(process.env.FIREBASE_AUTH_DOMAIN),
  projectId: getEnv(process.env.ID_DO_PROJETO_FIREBASE),
  storageBucket: getEnv(process.env.FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getEnv(process.env.ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE),
  appId: getEnv(process.env.ID_DO_APLICATIVO_FIREBASE)
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

export const getEnvStatus = () => ({
  apiKey: !!firebaseConfig.apiKey,
  projectId: firebaseConfig.projectId || null,
  authDomain: !!firebaseConfig.authDomain,
  storageBucket: !!firebaseConfig.storageBucket,
  messagingId: !!firebaseConfig.messagingSenderId,
  appId: !!firebaseConfig.appId,
  geminiKey: !!getEnv(process.env.API_KEY)
});

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase: Configuração detectada. Tentando conexão...");
  } catch (err) {
    console.error("🔥 Firebase: Erro de inicialização:", err);
  }
}

export { db };

export const testFirestoreConnection = async () => {
  if (!db) return false;
  try {
    const q = query(collection(db, 'patients'), limit(1));
    await getDocs(q);
    return true;
  } catch (e: any) {
    console.error("❌ Firestore Connection Error:", e.message);
    return false;
  }
};

export const seedDatabase = async (initialData: any) => {
  if (!db) return { success: false, message: "Banco de dados offline" };
  try {
    const batch = writeBatch(db);
    const collections = [
      { name: 'patients', data: initialData.patients },
      { name: 'inventory', data: initialData.inventory },
      { name: 'appointments', data: initialData.appointments },
      { name: 'transactions', data: initialData.transactions },
      { name: 'workshopOrders', data: initialData.workshopOrders }
    ];

    for (const col of collections) {
      for (const item of col.data) {
        const ref = doc(collection(db, col.name));
        const { id, ...dataWithoutId } = item;
        batch.set(ref, dataWithoutId);
      }
    }

    await batch.commit();
    return { success: true, message: "Dados enviados com sucesso!" };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
};

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  const q = collection(db, collectionName);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (err) => console.error(err));
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) return;
  return await addDoc(collection(db, collectionName), { ...data, createdAt: new Date().toISOString() });
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: new Date().toISOString() });
};