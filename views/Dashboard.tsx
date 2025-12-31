
import React from 'react';
import { Patient, Appointment, Transaction, InventoryItem, WorkshopOrder } from '../types';

interface DashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  workshopOrders: WorkshopOrder[];
}

const Dashboard: React.FC<DashboardProps> = ({ patients, appointments, transactions, inventory, workshopOrders }) => {
  const totalBalance = transactions.reduce((acc, curr) => curr.type === 'RECEITA' ? acc + curr.amount : acc - curr.amount, 0);
  const pendingWorkshop = workshopOrders.filter(o => o.status !== 'ENTREGUE').length;
  const lowStock = inventory.filter(i => i.quantity <= i.minQuantity).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pacientes Ativos</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{patients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Saldo Financeiro</p>
          <p className={`text-3xl font-bold mt-1 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Ordens na Oficina</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{pendingWorkshop}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Itens em Alerta</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{lowStock}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Atendimentos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Próximos Atendimentos</h3>
          <div className="space-y-4">
            {appointments.length > 0 ? appointments.map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{app.patientName}</p>
                  <p className="text-xs text-gray-500">{app.professional} • {app.date} às {app.time}</p>
                </div>
                <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700">
                  {app.status}
                </span>
              </div>
            )) : <p className="text-gray-400 text-sm">Nenhum atendimento agendado.</p>}
          </div>
        </div>

        {/* Status Oficina */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Status da Oficina</h3>
          <div className="space-y-4">
            {workshopOrders.length > 0 ? workshopOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{order.productType}</p>
                  <p className="text-xs text-gray-500">Paciente: {order.patientName}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                  order.status === 'PRODUCAO' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                }`}>
                  {order.status}
                </span>
              </div>
            )) : <p className="text-gray-400 text-sm">Nenhuma ordem de serviço.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
