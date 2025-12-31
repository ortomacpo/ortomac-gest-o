import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const savedUser = localStorage.getItem('ortomac_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const initData = async () => {
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
      
      // Fallback para dados locais se o Firebase falhar
      setFirestoreHealthy(false);
      setPatients(INITIAL_PATIENTS);
      setAppointments(INITIAL_APPOINTMENTS);
      setTransactions(INITIAL_FINANCE);
      setInventory(INITIAL_INVENTORY);
      setWorkshopOrders(INITIAL_WORKSHOP);
      setLoading(false);
    };

    initData();
  }, []);

  const handleSeed = async () => {
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

  // Helper local para garantir que a atualização de estoque funcione
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
        <p className="text-xs text-blue-300 mt-2 text-center px-6 uppercase">Estabelecendo Conexão Segura...</p>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${firebaseWorking ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm uppercase">Status da Infraestrutura Cloud</h4>
                  <p className="text-[10px] text-gray-500">Projeto conectado: <span className="font-bold text-blue-600">{env.projectId || 'Nenhum'}</span></p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-gray-400">FIRESTORE:</span>
                  <span className={`text-[10px] font-black ${firestoreHealthy ? 'text-green-600' : 'text-red-500'}`}>{firestoreHealthy ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
                {firebaseWorking && (
                  <button 
                    onClick={handleSeed}
                    disabled={syncLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black px-4 py-1.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    {syncLoading ? 'SINCRONIZANDO...' : 'Sincronizar Dados de Exemplo'}
                  </button>
                )}
              </div>
            </div>
            {!firebaseWorking && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-relaxed">
                <p><strong>⚠️ Atenção:</strong> O sistema está operando em <strong>Modo Local</strong>. Para ativar a nuvem:</p>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Certifique-se que adicionou as chaves no painel <strong>Settings {'->'} Environment Variables</strong> da Vercel.</li>
                  <li>Os nomes devem ser exatamente: <code>FIREBASE_API_KEY</code>, <code>ID_DO_PROJETO_FIREBASE</code>, etc.</li>
                  <li>Após salvar, você PRECISA fazer um <strong>Redeploy</strong> na Vercel para as chaves entrarem no código.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {currentUser.role === 'GESTOR' && (
          <button 
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className={`fixed bottom-20 right-6 w-12 h-12 shadow-2xl rounded-full flex items-center justify-center z-50 transition-all border-2 ${showDiagnostic ? 'bg-blue-900 text-white border-blue-800 rotate-90' : 'bg-white text-blue-900 border-gray-100'}`}
          >
            ⚙️
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