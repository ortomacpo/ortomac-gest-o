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

// Log de depuração para o console do navegador (F12)
console.log("🛠️ Verificando Configuração Firebase...");
console.log("ID do Projeto:", firebaseConfig.projectId === "undefined" ? "❌ NÃO DEFINIDO" : "✅ " + firebaseConfig.projectId);
console.log("API Key:", !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined" ? "✅ PRESENTE" : "❌ AUSENTE");

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "undefined" &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "undefined"
);

export const getEnvStatus = () => ({
  apiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined",
  projectId: firebaseConfig.projectId === "undefined" || !firebaseConfig.projectId ? null : firebaseConfig.projectId,
  appId: !!firebaseConfig.appId && firebaseConfig.appId !== "undefined",
  geminiKey: !!process.env.API_KEY && process.env.API_KEY !== "undefined"
});

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase Inicializado com Sucesso!");
  } catch (err) {
    console.error("🔥 Erro Crítico ao inicializar Firebase:", err);
  }
} else {
  console.warn("⚠️ Firebase NÃO está configurado. Rodando em Modo Local.");
}

export { db };

export const testFirestoreConnection = async () => {
  if (!db) {
    console.error("❌ Teste de Conexão: DB não inicializado.");
    return false;
  }
  try {
    console.log("🛰️ Testando comunicação com Firestore...");
    // Tenta uma operação simples de leitura
    const q = query(collection(db, 'patients'), limit(1));
    await getDocs(q);
    console.log("✅ Conexão com Firestore está SAUDÁVEL.");
    return true;
  } catch (e: any) {
    console.error("❌ Falha na comunicação com Firestore:", e.message);
    // Se o erro for "Permission Denied", as chaves estão certas mas as regras do Firebase estão fechadas
    if (e.message.includes("permission-denied")) {
      console.warn("🚨 DICA: Verifique as REGRAS DE SEGURANÇA (Security Rules) no console do Firebase. Devem estar em modo de teste ou abertas para leitura/escrita.");
    }
    return false;
  }
};

export const seedDatabase = async (initialData: any) => {
  if (!db) return { success: false, message: "Firebase não configurado ou DB offline" };
  try {
    const batch = writeBatch(db);
    
    // Popular coleções básicas
    const collections = [
      { name: 'patients', data: initialData.patients },
      { name: 'inventory', data: initialData.inventory },
      { name: 'appointments', data: initialData.appointments },
      { name: 'transactions', data: initialData.transactions },
      { name: 'workshopOrders', data: initialData.workshopOrders }
    ];

    for (const col of collections) {
      if (col.data && col.data.length > 0) {
        for (const item of col.data) {
          const ref = doc(collection(db, col.name));
          const { id, ...dataWithoutId } = item;
          batch.set(ref, dataWithoutId);
        }
      }
    }

    await batch.commit();
    return { success: true, message: "Banco de dados inicializado com sucesso na Nuvem!" };
  } catch (e: any) {
    console.error("Erro ao popular banco:", e);
    return { success: false, message: "Erro ao sincronizar: " + e.message };
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
      console.error(`❌ Erro em tempo real na coleção ${collectionName}:`, err.message);
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