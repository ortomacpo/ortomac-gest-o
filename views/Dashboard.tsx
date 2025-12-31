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
  const totalIn = transactions.filter(t => t.type === 'RECEITA').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'DESPESA').reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = totalIn - totalOut;
  
  const pendingWorkshop = workshopOrders.filter(o => o.status !== 'ENTREGUE').length;
  const lowStock = inventory.filter(i => i.quantity <= i.minQuantity).length;

  const maxFinance = Math.max(totalIn, totalOut, 1);
  const inPercent = (totalIn / maxFinance) * 100;
  const outPercent = (totalOut / maxFinance) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-blue-300 transition-all">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pacientes Ativos</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-4xl font-black text-blue-900">{patients.length}</p>
            <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">↑ 12%</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-green-300 transition-all">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saldo em Caixa</p>
          <p className={`text-3xl font-black mt-2 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-orange-300 transition-all">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Oficina Ativa</p>
          <p className="text-4xl font-black text-orange-600 mt-2">{pendingWorkshop}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-red-300 transition-all">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alertas de Estoque</p>
          <p className="text-4xl font-black text-red-600 mt-2">{lowStock}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico Financeiro Simplificado */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Saúde Financeira</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">Entradas</span>
                <span className="text-green-600 font-bold">R$ {totalIn.toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${inPercent}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">Saídas</span>
                <span className="text-red-600 font-bold">R$ {totalOut.toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all duration-1000" style={{ width: `${outPercent}%` }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              Dica: Suas entradas representam {((totalIn/maxFinance)*100).toFixed(0)}% do volume total transacionado este mês.
            </p>
          </div>
        </div>

        {/* Próximos Atendimentos */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Agenda do Dia</h3>
            <button className="text-blue-600 text-sm font-bold hover:underline">Ver tudo</button>
          </div>
          <div className="space-y-3">
            {appointments.length > 0 ? appointments.slice(0, 5).map(app => (
              <div key={app.id} className="flex items-center p-4 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-4">
                  {app.time}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{app.patientName}</p>
                  <p className="text-xs text-gray-500">{app.professional}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                    app.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-gray-400 text-center py-10">Nenhum atendimento para hoje.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;