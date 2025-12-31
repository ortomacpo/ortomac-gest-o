import React, { useState, useEffect, useCallback } from 'react';
import { User, Patient, Appointment, Transaction, InventoryItem, WorkshopOrder } from './types';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_FINANCE, INITIAL_INVENTORY, INITIAL_WORKSHOP } from './constants';
import Layout from './components/Layout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Agenda from './views/Agenda';
import Prontuarios from './views/Prontuarios';
import Financeiro from './views/Financeiro';
import Estoque from './views/Estoque';
import Oficina from './views/Oficina';
import { subscribeToCollection, addToCloud, updateInCloud, isFirebaseConfigured, getEnvStatus, db, testFirestoreConnection, seedDatabase } from './services/firebase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [firestoreHealthy, setFirestoreHealthy] = useState<boolean | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  const initData = useCallback(async () => {
    setLoading(true);
    setFirestoreHealthy(null);
    
    const configured = isFirebaseConfigured;
    console.log("App: Iniciando conexão... Configurado:", configured);

    if (configured && db) {
      const healthy = await testFirestoreConnection();
      setFirestoreHealthy(healthy);

      if (healthy) {
        console.log("App: Conexão Nuvem OK. Inscrevendo em coleções.");
        const unsubs = [
          subscribeToCollection('patients', (data) => setPatients(data as Patient[])),
          subscribeToCollection('appointments', (data) => setAppointments(data as Appointment[])),
          subscribeToCollection('transactions', (data) => setTransactions(data as Transaction[])),
          subscribeToCollection('inventory', (data) => setInventory(data as InventoryItem[])),
          subscribeToCollection('workshopOrders', (data) => setWorkshopOrders(data as WorkshopOrder[]))
        ];
        setLoading(false);
        return () => unsubs.forEach(unsub => unsub());
      }
    }
    
    console.warn("App: Falha na conexão Nuvem ou não configurado. Usando dados locais.");
    setFirestoreHealthy(false);
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setTransactions(INITIAL_FINANCE);
    setInventory(INITIAL_INVENTORY);
    setWorkshopOrders(INITIAL_WORKSHOP);
    setLoading(false);
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('ortomac_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    initData();
  }, [initData]);

  const handleSeed = async () => {
    if (!confirm("Isso vai enviar os dados de demonstração para sua Nuvem. Continuar?")) return;
    setSyncLoading(true);
    const result = await seedDatabase({
      patients: INITIAL_PATIENTS,
      inventory: INITIAL_INVENTORY,
      appointments: INITIAL_APPOINTMENTS,
      transactions: INITIAL_FINANCE,
      workshopOrders: INITIAL_WORKSHOP
    });
    alert(result.message);
    setSyncLoading(false);
    if (result.success) {
      // Pequeno delay para o Firestore propagar
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ortomac_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ortomac_user');
  };

  async function adjustInventoryInCloud(id: string, data: any) {
    if (isFirebaseConfigured && firestoreHealthy) {
      await updateInCloud('inventory', id, data);
    } else {
      setInventory(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
    }
  }

  if (!currentUser) return <Login onLogin={handleLogin} />;

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-blue-900 text-white">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold animate-pulse tracking-widest">ORTOMAC</h2>
        <p className="text-[10px] text-blue-300 mt-2 text-center px-6 uppercase tracking-tighter">Sincronizando com a Nuvem...</p>
      </div>
    );
  }

  const env = getEnvStatus();
  const firebaseWorking = isFirebaseConfigured && firestoreHealthy;

  return (
    <Layout
      userRole={currentUser.role}
      userName={currentUser.name}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSynced={firestoreHealthy}
    >
      <div className="relative">
        {showDiagnostic && (
          <div className="mb-6 p-6 rounded-3xl bg-white border border-blue-100 shadow-xl animate-in slide-in-from-top duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${firebaseWorking ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <h4 className="font-black text-gray-900 text-base uppercase">Diagnóstico de Infraestrutura</h4>
                  <p className="text-[11px] text-gray-500">Conectado ao Projeto: <span className="font-bold text-blue-600 underline">{env.projectId || 'Nenhum (Modo Local)'}</span></p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => initData()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-black px-4 py-2 rounded-xl transition-all"
                >
                  🔄 TENTAR RECONECTAR
                </button>
                {isFirebaseConfigured && (
                  <button 
                    onClick={handleSeed}
                    disabled={syncLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
                  >
                    {syncLoading ? 'ENVIANDO...' : '🚀 ENVIAR DADOS DEMO PARA NUVEM'}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border ${env.apiKey ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Status da API KEY</p>
                <p className={`text-xs font-black ${env.apiKey ? 'text-green-700' : 'text-red-700'}`}>{env.apiKey ? '✅ CONFIGURADA NA VERCEL' : '❌ AUSENTE OU INVÁLIDA'}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${firestoreHealthy ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Status do Banco (Firestore)</p>
                <p className={`text-xs font-black ${firestoreHealthy ? 'text-green-700' : 'text-red-700'}`}>{firestoreHealthy ? '✅ COMUNICAÇÃO ATIVA' : '❌ ERRO DE COMUNICAÇÃO'}</p>
              </div>
            </div>

            {!firebaseWorking && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 leading-relaxed shadow-inner">
                <p className="font-black mb-2 flex items-center"><span className="mr-2">💡</span> GUIA DE RESOLUÇÃO:</p>
                <ol className="list-decimal ml-5 space-y-2">
                  <li><strong>Vercel:</strong> Verifique se as variáveis no painel da Vercel estão com os nomes IDÊNTICOS aos do código (ex: <code>ID_DO_PROJETO_FIREBASE</code>).</li>
                  <li><strong>Redeploy:</strong> Após alterar variáveis na Vercel, você <u>precisa</u> ir em "Deployments" e clicar em "Redeploy".</li>
                  <li><strong>Regras do Firebase:</strong> No console do Firebase, vá em Firestore {'->'} Rules e garanta que o acesso está permitido (Ex: <code>allow read, write: if true;</code> para testes).</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {currentUser.role === 'GESTOR' && (
          <button 
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className={`fixed bottom-24 right-6 w-14 h-14 shadow-2xl rounded-full flex items-center justify-center z-50 transition-all border-4 ${showDiagnostic ? 'bg-blue-900 text-white border-blue-800 rotate-90' : 'bg-white text-blue-900 border-white hover:scale-110'}`}
          >
            <span className="text-2xl">{showDiagnostic ? '✕' : '⚙️'}</span>
          </button>
        )}
        
        {activeTab === 'dashboard' && <Dashboard patients={patients} appointments={appointments} transactions={transactions} inventory={inventory} workshopOrders={workshopOrders} />}
        {activeTab === 'agenda' && <Agenda appointments={appointments} onAddAppointment={(data) => addToCloud('appointments', data)} patients={patients} />}
        {activeTab === 'pacientes' && <Prontuarios patients={patients} onAddPatient={(data) => addToCloud('patients', data)} />}
        {activeTab === 'financeiro' && <Financeiro transactions={transactions} onAddTransaction={(data) => addToCloud('transactions', data)} />}
        {activeTab === 'estoque' && <Estoque inventory={inventory} onUpdateItem={(id, data) => adjustInventoryInCloud(id, data)} onAddItem={(data) => addToCloud('inventory', data)} />}
        {activeTab === 'oficina' && <Oficina orders={workshopOrders} onUpdateOrder={(id, data) => updateInCloud('workshopOrders', id, data)} onAddOrder={(data) => addToCloud('workshopOrders', data)} patients={patients} />}
      </div>
    </Layout>
  );
};

export default App;