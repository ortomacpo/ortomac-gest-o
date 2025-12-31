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
    const configured = isFirebaseConfigured;

    if (configured && db) {
      const healthy = await testFirestoreConnection();
      setFirestoreHealthy(healthy);

      if (healthy) {
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
    if (!confirm("Isso enviará os dados iniciais para seu banco na nuvem. Continuar?")) return;
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
    if (result.success) window.location.reload();
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ortomac_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ortomac_user');
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-blue-900 text-white p-6">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Iniciando Ortomac...</p>
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
      <div className="max-w-7xl mx-auto">
        {showDiagnostic && (
          <div className="mb-8 p-8 bg-white rounded-3xl border-2 border-blue-100 shadow-2xl animate-in slide-in-from-top duration-500">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-blue-900 uppercase">Painel de Infraestrutura</h3>
                <p className="text-sm text-gray-500">Verifique se as variáveis abaixo estão verdes na Vercel.</p>
              </div>
              <button onClick={() => setShowDiagnostic(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'API Key', status: env.apiKey, name: 'FIREBASE_API_KEY' },
                { label: 'Projeto ID', status: !!env.projectId, name: 'ID_DO_PROJETO_FIREBASE' },
                { label: 'Auth Domain', status: env.authDomain, name: 'FIREBASE_AUTH_DOMAIN' },
                { label: 'Storage', status: env.storageBucket, name: 'FIREBASE_STORAGE_BUCKET' },
                { label: 'Messaging', status: env.messagingId, name: 'ID_DO_REMETENTE_DE_MENSAGENS_DO_FIREBASE' },
                { label: 'App ID', status: env.appId, name: 'ID_DO_APLICATIVO_FIREBASE' },
                { label: 'IA (Gemini)', status: env.geminiKey, name: 'API_KEY' },
              ].map(item => (
                <div key={item.name} className={`p-4 rounded-2xl border ${item.status ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.label}</span>
                    <span className={`text-[10px] font-black ${item.status ? 'text-green-600' : 'text-red-600'}`}>{item.status ? 'OK' : 'FALTANDO'}</span>
                  </div>
                  <code className="text-[11px] font-mono font-bold text-gray-700">{item.name}</code>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg"
              >
                🔄 RECARREGAR APP
              </button>
              {isFirebaseConfigured && (
                <button 
                  onClick={handleSeed}
                  disabled={syncLoading}
                  className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {syncLoading ? 'ENVIANDO...' : '🚀 ENVIAR DADOS DEMO PARA NUVEM'}
                </button>
              )}
            </div>

            {!firebaseWorking && (
              <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-200">
                <p className="text-sm text-amber-900 leading-relaxed font-medium">
                  <strong>💡 Por que ainda aparece Modo Local?</strong><br/>
                  Se você já configurou as chaves acima na Vercel e elas aparecem como "FALTANDO", você <strong>precisa fazer um novo Deployment</strong>. Vá no painel da Vercel &rarr; Deployments &rarr; Clique nos "..." &rarr; <strong>Redeploy</strong>.
                </p>
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
        {activeTab === 'estoque' && <Estoque inventory={inventory} onUpdateItem={(id, data) => updateInCloud('inventory', id, data)} onAddItem={(data) => addToCloud('inventory', data)} />}
        {activeTab === 'oficina' && <Oficina orders={workshopOrders} onUpdateOrder={(id, data) => updateInCloud('workshopOrders', id, data)} onAddOrder={(data) => addToCloud('workshopOrders', data)} patients={patients} />}
      </div>
    </Layout>
  );
};

export default App;