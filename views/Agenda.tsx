
import React, { useState } from 'react';
import { Appointment, Patient } from '../types';

interface AgendaProps {
  appointments: Appointment[];
  onAddAppointment: (data: Omit<Appointment, 'id'>) => Promise<any>;
  patients: Patient[];
}

const Agenda: React.FC<AgendaProps> = ({ appointments, onAddAppointment, patients }) => {
  const [showModal, setShowModal] = useState(false);
  const [newApp, setNewApp] = useState({ patientId: '', date: '', time: '', professional: 'Dra. Ana' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === newApp.patientId);
    if (!patient) return;

    await onAddAppointment({
      patientId: patient.id,
      patientName: patient.name,
      date: newApp.date,
      time: newApp.time,
      professional: newApp.professional,
      status: 'PENDENTE'
    });

    setShowModal(false);
  };

  // Ordenar appointments por data/hora
  const sortedAppointments = [...appointments].sort((a, b) => 
    new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Calendário de Atendimentos</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Novo Agendamento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Profissional</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedAppointments.length > 0 ? sortedAppointments.map(app => (
              <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-900">{app.date}</p>
                  <p className="text-xs text-gray-500">{app.time}</p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{app.patientName}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{app.professional}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                    app.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400">Nenhum agendamento encontrado na nuvem.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Novo Agendamento</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={newApp.patientId}
                  onChange={e => setNewApp({...newApp, patientId: e.target.value})}
                  required
                >
                  <option value="">Selecione um paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input type="date" className="w-full border rounded-lg p-2" onChange={e => setNewApp({...newApp, date: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input type="time" className="w-full border rounded-lg p-2" onChange={e => setNewApp({...newApp, time: e.target.value})} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                <select className="w-full border rounded-lg p-2" onChange={e => setNewApp({...newApp, professional: e.target.value})} required>
                  <option value="Dra. Ana">Dra. Ana (Fisio)</option>
                  <option value="Dra. Paula">Dra. Paula (Fisio)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
