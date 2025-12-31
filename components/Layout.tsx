
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, userName, onLogout, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['GESTOR', 'FISIOTERAPEUTA', 'RECEPCIONISTA', 'TECNICO_ORTOPEDICO'] },
    { id: 'agenda', label: 'Agenda', icon: '📅', roles: ['GESTOR', 'FISIOTERAPEUTA', 'RECEPCIONISTA'] },
    { id: 'pacientes', label: 'Pacientes', icon: '👤', roles: ['GESTOR', 'FISIOTERAPEUTA', 'RECEPCIONISTA'] },
    { id: 'financeiro', label: 'Financeiro', icon: '💰', roles: ['GESTOR', 'RECEPCIONISTA'] },
    { id: 'estoque', label: 'Estoque', icon: '📦', roles: ['GESTOR', 'TECNICO_ORTOPEDICO'] },
    { id: 'oficina', label: 'Oficina', icon: '🛠️', roles: ['GESTOR', 'TECNICO_ORTOPEDICO'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-900 text-white transition-all duration-300">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-blue-100">ORTOMAC</h1>
          <p className="text-xs text-blue-300 uppercase tracking-widest mt-1">Gestão Clínica & Oficina</p>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {filteredMenu.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-blue-400 truncate">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-300 bg-red-900/30 rounded-lg hover:bg-red-900/50 transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="md:hidden flex items-center">
            <h1 className="text-xl font-bold text-blue-900">ORTOMAC</h1>
          </div>
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-700 capitalize">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Bottom Nav Mobile */}
        <nav className="md:hidden h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2">
          {filteredMenu.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
