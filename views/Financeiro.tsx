
import React, { useState } from 'react';
import { Transaction } from '../types';

interface FinanceiroProps {
  transactions: Transaction[];
  onAddTransaction: (data: Omit<Transaction, 'id'>) => Promise<any>;
}

const Financeiro: React.FC<FinanceiroProps> = ({ transactions, onAddTransaction }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTx, setNewTx] = useState<Partial<Transaction>>({ type: 'RECEITA', amount: 0, description: '', category: 'Vendas' });

  const totalIn = transactions.filter(t => t.type === 'RECEITA').reduce((a, b) => a + b.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'DESPESA').reduce((a, b) => a + b.amount, 0);

  // Update handleAdd to use the onAddTransaction cloud function provided by App
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddTransaction({
      description: newTx.description || 'Sem descrição',
      amount: Number(newTx.amount),
      type: newTx.type as 'RECEITA' | 'DESPESA',
      date: new Date().toISOString().split('T')[0],
      category: newTx.category || 'Outros'
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <p className="text-sm font-medium text-green-700">Entradas</p>
          <p className="text-3xl font-bold text-green-900 mt-1">R$ {totalIn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-100">
          <p className="text-sm font-medium text-red-700">Saídas</p>
          <p className="text-3xl font-bold text-red-900 mt-1">R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-700">Fluxo de Caixa</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">R$ {(totalIn - totalOut).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Lançamentos Recentes</h3>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            + Novo Lançamento
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{t.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                      t.type === 'RECEITA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Novo Lançamento</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'RECEITA'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newTx.type === 'RECEITA' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                >Receita</button>
                <button
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'DESPESA'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newTx.type === 'DESPESA' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}
                >Despesa</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input type="text" className="w-full border rounded-lg p-2" onChange={e => setNewTx({...newTx, description: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input type="number" step="0.01" className="w-full border rounded-lg p-2" onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select className="w-full border rounded-lg p-2" onChange={e => setNewTx({...newTx, category: e.target.value})}>
                    <option>Vendas</option>
                    <option>Insumos</option>
                    <option>Salários</option>
                    <option>Aluguel/Contas</option>
                    <option>Marketing</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;
