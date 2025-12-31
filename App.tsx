
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
  
  // Inicializa com dados locais para garantir que o preview nunca fique vazio
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_FINANCE);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [workshopOrders, setWorkshopOrders] = useState<WorkshopOrder[]>(INITIAL_WORKSHOP);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('ortomac_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    if (isFirebaseConfigured) {
      // Se houver Firebase, os dados locais serão substituídos pelos da nuvem
      const unsubPatients = subscribeToCollection('patients', (data) => data.length > 0 && setPatients(data as Patient[]));
      const unsubAppointments = subscribeToCollection('appointments', (data) => data.length > 0 && setAppointments(data as Appointment[]));
      const unsubTransactions = subscribeToCollection('transactions', (data) => data.length > 0 && setTransactions(data as Transaction[]));
      const unsubInventory = subscribeToCollection('inventory', (data) => data.length > 0 && setInventory(data as InventoryItem[]));
      const unsubWorkshop = subscribeToCollection('workshopOrders', (data) => data.length > 0 && setWorkshopOrders(data as WorkshopOrder[]));

      setLoading(false);
      return () => {
        unsubPatients();
        unsubAppointments();
        unsubTransactions();
        unsubInventory();
        unsubWorkshop();
      };
    } else {
      // Se não houver Firebase, apenas remove o loading e usa os dados constantes
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

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-blue-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando Ortomac...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard patients={patients} appointments={appointments} transactions={transactions} inventory={inventory} workshopOrders={workshopOrders} />;
      case 'agenda':
        return <Agenda 
          appointments={appointments} 
          onAddAppointment={(data) => addToCloud('appointments', data)} 
          patients={patients} 
        />;
      case 'pacientes':
        return <Prontuarios 
          patients={patients} 
          onAddPatient={(data) => addToCloud('patients', data)} 
        />;
      case 'financeiro':
        return <Financeiro 
          transactions={transactions} 
          onAddTransaction={(data) => addToCloud('transactions', data)} 
        />;
      case 'estoque':
        return <Estoque 
          inventory={inventory} 
          onUpdateItem={(id, data) => updateInCloud('inventory', id, data)}
          onAddItem={(data) => addToCloud('inventory', data)}
        />;
      case 'oficina':
        return <Oficina 
          orders={workshopOrders} 
          onUpdateOrder={(id, data) => updateInCloud('workshopOrders', id, data)}
          onAddOrder={(data) => addToCloud('workshopOrders', data)}
          patients={patients} 
        />;
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
      {renderContent()}
    </Layout>
  );
};

export default App;
