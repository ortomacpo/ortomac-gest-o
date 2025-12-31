import React, { useState } from 'react';
import { Patient } from '../types';
import { getClinicalInsight } from '../services/gemini';

interface ProntuariosProps {
  patients: Patient[];
  onAddPatient: (data: Omit<Patient, 'id'>) => Promise<any>;
}

const Prontuarios: React.FC<ProntuariosProps> = ({ patients, onAddPatient }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    email: '',
    cpf: '',
    observations: ''
  });

  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddPatient(newPatient);
    setShowModal(false);
    setNewPatient({ name: '', phone: '', email: '', cpf: '', observations: '' });
  };

  const handleGenerateInsight = async (obs: string) => {
    setLoadingInsight(true);
    try {
      const result = await getClinicalInsight(obs);
      setInsight(result);
    } catch (err) {
      setInsight("Erro ao processar análise.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
          >
            <span>+</span> <span>Novo Paciente</span>
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar paciente..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto">
          {filteredPatients.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {filteredPatients.map(p => (
                <li
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setInsight(null); }}
                  className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedPatient?.id === p.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                >
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.phone}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              Nenhum paciente encontrado.
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedPatient ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                <p className="text-sm text-gray-500">CPF: {selectedPatient.cpf} • {selectedPatient.email}</p>
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium">Editar</button>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">📋</span> Histórico Clínico
              </h3>
              <div className="p-4 bg-gray-50 rounded-xl text-gray-700 text-sm leading-relaxed mb-4 min-h-[100px] whitespace-pre-wrap">
                {selectedPatient.observations || "Sem observações registradas."}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleGenerateInsight(selectedPatient.observations)}
                  disabled={loadingInsight || !selectedPatient.observations}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <span>✨</span>
                  <span>{loadingInsight ? 'Analisando...' : 'IA: Analisar Quadro Clínico'}</span>
                </button>
              </div>

              {insight && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                  <h4 className="text-xs font-bold text-purple-800 uppercase tracking-widest mb-2">Sugestão Técnica Ortomac (IA)</h4>
                  <p className="text-sm text-purple-900 leading-relaxed whitespace-pre-wrap">{insight}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-2xl">👤</div>
            <p className="font-medium">Selecione um paciente na lista</p>
            <p className="text-sm">ou cadastre um novo para começar o atendimento.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-900">Novo Cadastro de Paciente</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSavePatient} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPatient.name}
                  onChange={e => setNewPatient({...newPatient, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone/WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    className="w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPatient.phone}
                    onChange={e => setNewPatient({...newPatient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    className="w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newPatient.cpf}
                    onChange={e => setNewPatient({...newPatient, cpf: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input
                  type="email"
                  className="w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPatient.email}
                  onChange={e => setNewPatient({...newPatient, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Observações Iniciais / Motivo da Consulta</label>
                <textarea
                  rows={3}
                  className="w-full border rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newPatient.observations}
                  onChange={e => setNewPatient({...newPatient, observations: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all"
                >
                  Salvar na Nuvem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prontuarios;