
import React, { useState } from 'react';
import { WorkshopOrder, Patient } from '../types';

interface OficinaProps {
  orders: WorkshopOrder[];
  onUpdateOrder: (id: string, data: Partial<WorkshopOrder>) => Promise<any>;
  onAddOrder: (data: Omit<WorkshopOrder, 'id'>) => Promise<any>;
  patients: Patient[];
}

const Oficina: React.FC<OficinaProps> = ({ orders, onUpdateOrder, onAddOrder, patients }) => {
  const [showModal, setShowModal] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<WorkshopOrder>>({ patientName: '', productType: '', status: 'PRODUCAO', technician: 'João Técnico' });

  const statusColors: any = {
    'PRODUCAO': 'bg-orange-100 text-orange-700',
    'AJUSTE': 'bg-purple-100 text-purple-700',
    'FINALIZADO': 'bg-blue-100 text-blue-700',
    'ENTREGUE': 'bg-green-100 text-green-700'
  };

  // Update handleAdd to use the onAddOrder cloud function
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddOrder({
      patientName: newOrder.patientName || 'Não Informado',
      productType: newOrder.productType || 'Órtese',
      status: 'PRODUCAO',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days from now
      technician: newOrder.technician || 'João Técnico',
      description: newOrder.description || ''
    });
    setShowModal(false);
  };

  // Update updateStatus to use the onUpdateOrder cloud function
  const updateStatus = async (id: string, newStatus: WorkshopOrder['status']) => {
    await onUpdateOrder(id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Oficina Ortopédica - Ordens de Serviço</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Abrir OS
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-400">{order.id}</span>
                  <h4 className="text-lg font-bold text-gray-900">{order.productType}</h4>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Paciente:</span> {order.patientName} | <span className="font-semibold">Técnico:</span> {order.technician}
                </p>
                <p className="text-xs text-gray-400 mt-1 italic">{order.description}</p>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="text-right mr-4 hidden md:block">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Prazo</p>
                  <p className="text-sm font-semibold text-gray-700">{order.deadline}</p>
                </div>
                <select 
                  className="text-sm border rounded-lg p-2 outline-none bg-gray-50 focus:ring-1 focus:ring-blue-500"
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as any)}
                >
                  <option value="PRODUCAO">Em Produção</option>
                  <option value="AJUSTE">Ajustes Finais</option>
                  <option value="FINALIZADO">Pronto para Entrega</option>
                  <option value="ENTREGUE">Entregue</option>
                </select>
                <button className="text-gray-400 hover:text-blue-600 p-2">⚙️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Nova Ordem de Serviço</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                <select className="w-full border rounded-lg p-2" onChange={e => setNewOrder({...newOrder, patientName: e.target.value})} required>
                  <option value="">Selecione um paciente</option>
                  {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento / Produto</label>
                <input 
                  placeholder="Ex: Prótese Transtibial" 
                  type="text" 
                  className="w-full border rounded-lg p-2" 
                  onChange={e => setNewOrder({...newOrder, productType: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Trabalho</label>
                <textarea 
                  className="w-full border rounded-lg p-2" 
                  rows={3}
                  onChange={e => setNewOrder({...newOrder, description: e.target.value})}
                  placeholder="Especificações técnicas, medidas, etc."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável Técnico</label>
                <select className="w-full border rounded-lg p-2" onChange={e => setNewOrder({...newOrder, technician: e.target.value})}>
                  <option value="João Técnico">João Técnico</option>
                  <option value="Marcos Protesista">Marcos Protesista</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md">Iniciar OS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;
