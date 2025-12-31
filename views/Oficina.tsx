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
  const [newOrder, setNewOrder] = useState<Partial<WorkshopOrder>>({ 
    patientName: '', 
    productType: '', 
    status: 'PRODUCAO', 
    technician: 'João Técnico',
    progress: 10
  });

  const statusMap: Record<WorkshopOrder['status'], { color: string, progress: number }> = {
    'PRODUCAO': { color: 'bg-orange-500', progress: 25 },
    'AJUSTE': { color: 'bg-purple-500', progress: 60 },
    'FINALIZADO': { color: 'bg-blue-500', progress: 90 },
    'ENTREGUE': { color: 'bg-green-500', progress: 100 }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddOrder({
      patientName: newOrder.patientName || 'Não Informado',
      productType: newOrder.productType || 'Órtese',
      status: 'PRODUCAO',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      technician: newOrder.technician || 'João Técnico',
      description: newOrder.description || '',
      progress: 25
    });
    setShowModal(false);
  };

  const updateStatus = async (id: string, newStatus: WorkshopOrder['status']) => {
    await onUpdateOrder(id, { 
      status: newStatus,
      progress: statusMap[newStatus].progress
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-gray-900">Oficina Ortopédica</h3>
          <p className="text-sm text-gray-500">Gestão de produção e manutenção de órteses/próteses.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center"
        >
          <span className="mr-2">+</span> Abrir OS
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length > 0 ? orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded border uppercase tracking-widest">{order.id}</span>
                  <h4 className="text-xl font-black text-gray-900">{order.productType}</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Paciente</p>
                    <p className="text-sm font-bold text-gray-700">{order.patientName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Responsável</p>
                    <p className="text-sm font-bold text-gray-700">{order.technician}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Prazo de Entrega</p>
                    <p className="text-sm font-bold text-gray-700">{order.deadline}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Status Atual</p>
                    <select 
                      className="text-xs font-bold border-none bg-transparent text-blue-600 focus:ring-0 cursor-pointer p-0"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as any)}
                    >
                      <option value="PRODUCAO">🚀 Em Produção</option>
                      <option value="AJUSTE">🔧 Ajustes</option>
                      <option value="FINALIZADO">✅ Finalizado</option>
                      <option value="ENTREGUE">📦 Entregue</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-64">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500">Progresso da OS</span>
                  <span className="text-xs font-black text-blue-700">{order.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${statusMap[order.status].color}`}
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            {order.description && (
              <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                <p className="text-xs text-gray-500 italic">Notas técnicas: {order.description}</p>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Nenhuma ordem de serviço ativa.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-blue-900">Nova Ordem de Serviço</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Paciente Ortomac</label>
                <select className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500" onChange={e => setNewOrder({...newOrder, patientName: e.target.value})} required>
                  <option value="">Selecione...</option>
                  {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Produto</label>
                <input 
                  placeholder="Ex: Prótese KAFO Carbono" 
                  type="text" 
                  className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setNewOrder({...newOrder, productType: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição Técnica</label>
                <textarea 
                  className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-500" 
                  rows={3}
                  onChange={e => setNewOrder({...newOrder, description: e.target.value})}
                  placeholder="Medidas, materiais e especificações..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all">Iniciar OS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oficina;