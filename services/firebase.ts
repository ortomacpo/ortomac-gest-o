import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, doc, Firestore, getDocs, limit, query, writeBatch } from "firebase/firestore";

// Função ultra-segura para limpar valores vindos da Vercel
const cleanValue = (val: any): string | undefined => {
  if (val === undefined || val === null) return undefined;
  const str = String(val).trim();
  if (str === '' || str === 'undefined' || str === 'null' || str === '""' || str === "''") return undefined;
  return str;
};

const firebaseConfig = {
  apiKey: cleanValue(process.env.FIREBASE_API_KEY),
  authDomain: cleanValue(process.env.FIREBASE_AUTH_DOMAIN),
  projectId: cleanValue(process.env.ID_DO_PROJETO_FIREBASE),
  storageBucket: cleanValue(process.env.FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanValue(process.env.ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE),
  appId: cleanValue(process.env.ID_DO_APLICATIVO_FIREBASE)
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
  geminiKey: !!cleanValue(process.env.API_KEY)
});

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("✅ Firebase inicializado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao inicializar Firebase:", err);
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
    console.warn("⚠️ Firestore conectado mas sem acesso ou vazio:", e.message);
    // Se o erro for apenas que a coleção não existe, ainda consideramos "saudável" o suficiente para tentar o seed
    return e.code !== 'permission-denied';
  }
};

export const seedDatabase = async (initialData: any) => {
  if (!db) return { success: false, message: "Banco de dados offline. Verifique as chaves." };
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
      if (col.data) {
        for (const item of col.data) {
          const ref = doc(collection(db, col.name));
          const { id, ...dataWithoutId } = item;
          batch.set(ref, dataWithoutId);
        }
      }
    }

    await batch.commit();
    return { success: true, message: "Nuvem Ortomac sincronizada com sucesso!" };
  } catch (e: any) {
    return { success: false, message: "Erro de sincronização: " + e.message };
  }
};

export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  try {
    const q = collection(db, collectionName);
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (err) => console.error(`Erro na coleção ${collectionName}:`, err));
  } catch (e) {
    return () => {};
  }
};

export const addToCloud = async (collectionName: string, data: any) => {
  if (!db) return;
  return await addDoc(collection(db, collectionName), { ...data, createdAt: new Date().toISOString() });
};

export const updateInCloud = async (collectionName: string, id: string, data: any) => {
  if (!db) return;
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: new Date().toISOString() });
};