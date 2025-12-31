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
  
  // Se o Firebase estiver configurado, começamos com listas vazias para carregar o real.
  // Se não estiver, usamos os dados iniciais (mock) para o usuário não ver tela vazia.
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
      console.log("🔗 Iniciando escuta em tempo real...");
      const unsubs = [
        subscribeToCollection('patients', (data) => { 
          setPatients(data as Patient[]); 
          setLoading(false); 
        }),
        subscribeToCollection('appointments', (data) => setAppointments(data as Appointment[])),
        subscribeToCollection('transactions', (data) => setTransactions(data as Transaction[])),
        subscribeToCollection('inventory', (data) => setInventory(data as InventoryItem[])),
        subscribeToCollection('workshopOrders', (data) => setWorkshopOrders(data as WorkshopOrder[]))
      ];

      // Timeout de segurança para o loading caso o banco esteja vazio
      const timeout = setTimeout(() => setLoading(false), 3000);

      return () => {
        unsubs.forEach(unsub => unsub());
        clearTimeout(timeout);
      };
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
        <p className="font-bold tracking-widest animate-pulse uppercase text-sm">Conectando à Nuvem Ortomac...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard patients={patients} appointments={appointments} transactions={transactions} inventory={inventory} workshopOrders={workshopOrders} />;
      case 'agenda':
        return <Agenda appointments={appointments} onAddAppointment={(data) => addToCloud('appointments', data)} patients={patients} />;
      case 'pacientes':
        return <Prontuarios patients={patients} onAddPatient={(data) => addToCloud('patients', data)} />;
      case 'financeiro':
        return <Financeiro transactions={transactions} onAddTransaction={(data) => addToCloud('transactions', data)} />;
      case 'estoque':
        return <Estoque inventory={inventory} onUpdateItem={(id, data) => updateInCloud('inventory', id, data)} onAddItem={(data) => addToCloud('inventory', data)} />;
      case 'oficina':
        return <Oficina orders={workshopOrders} onUpdateOrder={(id, data) => updateInCloud('workshopOrders', id, data)} onAddOrder={(data) => addToCloud('workshopOrders', data)} patients={patients} />;
      default:
        return <Dashboard patients={patients} appointments={appointments} transactions={transactions} inventory={inventory} workshopOrders={workshopOrders} />;
    }
  };

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
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white px-8 py-3 rounded-full shadow-2xl font-black text-xs uppercase animate-bounce border-4 border-white">
            🚨 MODO OFFLINE: VERIFIQUE AS CHAVES NA VERCEL
          </div>
        )}
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;