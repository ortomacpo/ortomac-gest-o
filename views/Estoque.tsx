
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface EstoqueProps {
  inventory: InventoryItem[];
  onUpdateItem: (id: string, data: Partial<InventoryItem>) => Promise<any>;
  onAddItem: (data: Omit<InventoryItem, 'id'>) => Promise<any>;
}

const Estoque: React.FC<EstoqueProps> = ({ inventory, onUpdateItem, onAddItem }) => {
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ name: '', quantity: 0, minQuantity: 0, unit: 'un', price: 0 });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddItem({
      name: newItem.name || 'Novo Item',
      quantity: Number(newItem.quantity),
      minQuantity: Number(newItem.minQuantity),
      unit: newItem.unit || 'un',
      price: Number(newItem.price)
    });
    setShowModal(false);
  };

  const adjustQuantity = (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    onUpdateItem(item.id, { quantity: newQty });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Controle de Materiais Cloud</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Adicionar Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.length > 0 ? inventory.map(item => {
          const isLow = item.quantity <= item.minQuantity;
          return (
            <div key={item.id} className={`p-5 rounded-xl border bg-white shadow-sm transition-all ${isLow ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500">Unidade: {item.unit} | R$ {item.price.toFixed(2)}</p>
                </div>
                {isLow && <span className="text-red-500 animate-pulse text-xs font-bold uppercase">🚨 Baixo</span>}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Qtd Atual</p>
                  <p className={`text-2xl font-black ${isLow ? 'text-red-600' : 'text-blue-900'}`}>{item.quantity} {item.unit}</p>
                </div>
                <div className="space-x-1">
                  <button className="p-2 hover:bg-gray-100 rounded text-xl" onClick={() => adjustQuantity(item, 1)}>➕</button>
                  <button className="p-2 hover:bg-gray-100 rounded text-xl" onClick={() => adjustQuantity(item, -1)}>➖</button>
                </div>
              </div>
            </div>
          );
        }) : <div className="col-span-full py-10 text-center text-gray-400">Nenhum material cadastrado.</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-900">Novo Material (Nuvem)</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
                <input type="text" className="w-full border rounded-lg p-2" onChange={e => setNewItem({...newItem, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qtd Atual</label>
                  <input type="number" className="w-full border rounded-lg p-2" onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qtd Mínima</label>
                  <input type="number" className="w-full border rounded-lg p-2" onChange={e => setNewItem({...newItem, minQuantity: Number(e.target.value)})} required />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estoque;
