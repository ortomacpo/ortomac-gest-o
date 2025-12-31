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
      const configured = isFirebaseConfigured;
      
      if (configured && db) {
        const healthy = await testFirestoreConnection();
        setFirestoreHealthy(healthy);

        const unsubs = [
          subscribeToCollection('patients', (data) => setPatients(data as Patient[])),
          subscribeToCollection('appointments', (data) => setAppointments(data as Appointment[])),
          subscribeToCollection('transactions', (data) => setTransactions(data as Transaction[])),
          subscribeToCollection('inventory', (data) => setInventory(data as InventoryItem[])),
          subscribeToCollection('workshopOrders', (data) => setWorkshopOrders(data as WorkshopOrder[]))
        ];
        
        setLoading(false);
        return () => unsubs.forEach(unsub => unsub());
      } else {
        // Fallback para dados locais se o Firebase não estiver configurado
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
        <p className="text-xs text-blue-300 mt-2">Sincronizando Nuvem...</p>
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
    >
      <div className="relative">
        {(!firebaseWorking || showDiagnostic) && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${!firebaseWorking ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center space-x-3">
              <span className="text-xl">{!firebaseWorking ? '⚠️' : '✅'}</span>
              <div>
                <p className="font-bold text-xs uppercase text-gray-800">
                  Status da Conexão Nuvem
                </p>
                <div className="flex gap-3 mt-1">
                  <span className={`text-[9px] font-bold ${env.apiKey ? 'text-green-600' : 'text-red-500'}`}>API: {env.apiKey ? 'OK' : 'FALTA'}</span>
                  <span className={`text-[9px] font-bold ${env.projectId ? 'text-green-600' : 'text-red-500'}`}>PROJETO: {env.projectId ? 'OK' : 'FALTA'}</span>
                  <span className={`text-[9px] font-bold ${firestoreHealthy ? 'text-green-600' : 'text-red-500'}`}>BANCO: {firestoreHealthy ? 'OK' : 'ERRO'}</span>
                </div>
              </div>
            </div>
            {!firebaseWorking && (
              <p className="text-[10px] text-amber-800 max-w-[200px] leading-tight">
                Verifique as Environment Variables na Vercel e faça o Redeploy.
              </p>
            )}
          </div>
        )}

        {currentUser.role === 'GESTOR' && (
          <button 
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="fixed bottom-20 right-6 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center border border-gray-100 z-50 hover:scale-110 transition-transform"
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