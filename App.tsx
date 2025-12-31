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
import { subscribeToCollection, addToCloud, updateInCloud, isFirebaseConfigured, db } from './services/firebase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>(isFirebaseConfigured ? [] : INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(isFirebaseConfigured ? [] : INITIAL_APPOINTMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(isFirebaseConfigured ? [] : INITIAL_FINANCE);
  const [inventory, setInventory] = useState<InventoryItem[]>(isFirebaseConfigured ? [] : INITIAL_INVENTORY);
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>(isFirebaseConfigured ? [] : INITIAL_WORKSHOP);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    const savedUser = localStorage.getItem('ortomac_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    if (isFirebaseConfigured && db) {
      const unsubs = [
        subscribeToCollection('patients', (data) => { setPatients(data as Patient[]); setLoading(false); }),
        subscribeToCollection('appointments', (data) => setAppointments(data as Appointment[])),
        subscribeToCollection('transactions', (data) => setTransactions(data as Transaction[])),
        subscribeToCollection('inventory', (data) => setInventory(data as InventoryItem[])),
        subscribeToCollection('workshopOrders', (data) => setWorkshopOrders(data as WorkshopOrder[]))
      ];
      const timeout = setTimeout(() => setLoading(false), 3000);
      return () => { unsubs.forEach(unsub => unsub()); clearTimeout(timeout); };
    } else {
      setLoading(false);
    }
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
        <p className="font-bold tracking-widest animate-pulse uppercase text-sm">Conectando à Nuvem...</p>
      </div>
    );
  }

  return (
    <Layout
      userRole={currentUser.role}
      userName={currentUser.name}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <div className="relative">
        {!isFirebaseConfigured && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white px-6 py-2 rounded-full shadow-2xl flex items-center space-x-4 border-2 border-white">
            <span className="font-black text-[10px] uppercase">🚨 Modo Offline</span>
            <button 
              onClick={() => alert("As chaves do Firebase não foram detectadas. Certifique-se de que adicionou VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc, nas Environment Variables da Vercel e fez um novo Deploy.")}
              className="bg-white text-red-600 text-[10px] px-2 py-0.5 rounded font-bold"
            >
              Como resolver?
            </button>
          </div>
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