
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified logic: matches username, password is hardcoded as '123' for all for demo
    const user = MOCK_USERS.find(u => u.username === username.toLowerCase());
    
    if (user && (password === '123' || password === username)) {
      onLogin(user);
    } else {
      setError('Credenciais inválidas. Tente "gestor", "fisio", "recep" ou "tecnico" com senha "123".');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold">
            O
          </div>
          <h2 className="text-3xl font-extrabold text-blue-900">Ortomac</h2>
          <p className="text-gray-500 mt-2">Órteses e Próteses Ortopédicas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ex: gestor"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transform active:scale-95 transition-all"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Acesso exclusivo para funcionários Ortomac.<br/>
            Versão 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
