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
import { subscribeToCollection, addToCloud, updateInCloud, isFirebaseConfigured, getEnvStatus, db, testFirestoreConnection } from './services/firebase';

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

  useEffect(() => {
    const savedUser = localStorage.getItem('ortomac_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const initData = async () => {
      if (isFirebaseConfigured && db) {
        // Testa a conexão real com o banco
        const healthy = await testFirestoreConnection();
        setFirestoreHealthy(healthy);

        const unsubs = [
          subscribeToCollection('patients', (data) => setPatients(data as Patient[])),
          subscribeToCollection('appointments', (data) => setAppointments(data as Appointment[])),
          subscribeToCollection('transactions', (data) => setTransactions(data as Transaction[])),
          subscribeToCollection('inventory', (data) => setInventory(data as InventoryItem[])),
          subscribeToCollection('workshopOrders', (data) => setWorkshopOrders(data as WorkshopOrder[]))
        ];
        
        setTimeout(() => setLoading(false), 1000);
        return () => unsubs.forEach(unsub => unsub());
      } else {
        setPatients(INITIAL_PATIENTS);
        setAppointments(INITIAL_APPOINTMENTS);
        setTransactions(INITIAL_FINANCE);
        setInventory(INITIAL_INVENTORY);
        setWorkshopOrders(INITIAL_WORKSHOP);
        setLoading(false);
      }
    };

    initData();
  }, []);

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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-blue-900 text-white">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold animate-pulse tracking-widest">ORTOMAC</h2>
        <p className="text-xs text-blue-300 mt-2">Sincronizando Nuvem Ortomac-1...</p>
      </div>
    );
  }

  const env = getEnvStatus();

  return (
    <Layout
      userRole={currentUser.role}
      userName={currentUser.name}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="relative">
        {(!isFirebaseConfigured || showDiagnostic) && (
          <div className={`mb-6 p-5 rounded-3xl flex items-center justify-between border-2 ${!isFirebaseConfigured || firestoreHealthy === false ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{!isFirebaseConfigured ? '⚠️' : firestoreHealthy ? '✅' : '❌'}</span>
              <div>
                <p className={`font-black text-sm uppercase ${!isFirebaseConfigured ? 'text-red-800' : 'text-blue-800'}`}>
                  {!isFirebaseConfigured ? 'Firebase: Não Configurado' : `Firestore: ${firestoreHealthy ? 'Conectado' : 'Erro de Permissão'}`}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <span className={`text-[10px] font-bold ${env.projectId ? 'text-green-600' : 'text-red-400'}`}>ID PROJETO: {env.projectId ? 'OK' : 'FALTA'}</span>
                  <span className={`text-[10px] font-bold ${firestoreHealthy ? 'text-green-600' : 'text-red-400'}`}>BANCO DADOS: {firestoreHealthy ? 'ATIVO' : 'BLOQUEADO'}</span>
                  <span className={`text-[10px] font-bold ${env.geminiKey ? 'text-green-600' : 'text-red-400'}`}>IA GEMINI: {env.geminiKey ? 'ATIVO' : 'FALTA'}</span>
                </div>
              </div>
            </div>
            {!isFirebaseConfigured && (
              <button 
                onClick={() => window.open('https://vercel.com', '_blank')}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              >
                Abrir Vercel
              </button>
            )}
          </div>
        )}

        {currentUser.role === 'GESTOR' && (
          <button 
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="fixed bottom-20 right-6 w-12 h-12 bg-white shadow-2xl rounded-full flex items-center justify-center border border-gray-100 z-[100] hover:scale-110 active:scale-90 transition-all"
            title="Diagnóstico de Sistema"
          >
            ⚙️
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