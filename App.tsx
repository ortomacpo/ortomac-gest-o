import React, { useState, useEffect } from 'react';
import { User, Patient, Appointment, Transaction, InventoryItem, WorkshopOrder } from './types';
import { MOCK_USERS, INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_FINANCE, INITIAL_INVENTORY, INITIAL_WORKSHOP } from './constants';
import Layout from './components/Layout';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Agenda from './views/Agenda';
import Prontuarios from './views/Prontuarios';
import Financeiro from './views/Financeiro';
import Estoque from './views/Estoque';
import Oficina from './views/Oficina';
import { subscribeToCollection, addToCloud, updateInCloud, isFirebaseConfigured } from './services/firebase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Se estivermos na nuvem, começamos com array vazio para não misturar dados
  const [patients, setPatients] = useState<Patient[]>(isFirebaseConfigured ? [] : INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(isFirebaseConfigured ? [] : INITIAL_APPOINTMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(isFirebaseConfigured ? [] : INITIAL_FINANCE);
  const [inventory, setInventory] = useState<InventoryItem[]>(isFirebaseConfigured ? [] : INITIAL_INVENTORY);
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>(isFirebaseConfigured ? [] : INITIAL_WORKSHOP);
  
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ortomac_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    if (isFirebaseConfigured) {
      setIsSyncing(true);
      
      const unsubs = [
        subscribeToCollection('patients', (data) => setPatients(data as Patient[])),
        subscribeToCollection('appointments', (data) => setAppointments(data as Appointment[])),
        subscribeToCollection('transactions', (data) => setTransactions(data as Transaction[])),
        subscribeToCollection('inventory', (data) => setInventory(data as InventoryItem[])),
        subscribeToCollection('workshopOrders', (data) => setWorkshopOrders(data as WorkshopOrder[]))
      ];

      setLoading(false);
      // Simula fim do carregamento inicial após 1s para garantir que os snaps chegaram
      setTimeout(() => setIsSyncing(false), 1500);

      return () => unsubs.forEach(unsub => unsub());
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
      <div className="h-screen w-screen flex items-center justify-center bg-blue-900 text-white font-bold">
        Sincronizando Banco de Dados...
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
        {isSyncing && (
          <div className="fixed top-20 right-4 z-50 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full animate-pulse shadow-lg font-bold uppercase tracking-widest">
            Sincronizando Nuvem...
          </div>
        )}
        {!isFirebaseConfigured && (
          <div className="mb-4 p-2 bg-red-100 text-red-800 text-[10px] font-bold uppercase text-center rounded-lg border border-red-200">
            🚨 ATENÇÃO: ERRO DE CONFIGURAÇÃO DE NUVEM. Verifique as chaves no painel da Vercel.
          </div>
        )}
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;