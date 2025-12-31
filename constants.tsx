
import React from 'react';
import { User, Patient, InventoryItem, WorkshopOrder, Appointment, Transaction } from './types';

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Gestor Ortomac', role: 'GESTOR', username: 'gestor' },
  { id: '2', name: 'Dra. Ana Fisioterapeuta', role: 'FISIOTERAPEUTA', username: 'fisio' },
  { id: '3', name: 'Carla Recepção', role: 'RECEPCIONISTA', username: 'recep' },
  { id: '4', name: 'João Técnico Ortopédico', role: 'TECNICO_ORTOPEDICO', username: 'tecnico' }
];

export const INITIAL_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Carlos Silva', phone: '(11) 99999-8888', email: 'carlos@email.com', cpf: '123.456.789-00', observations: 'Paciente com histórico de lesão no joelho esquerdo.' },
  { id: 'p2', name: 'Maria Souza', phone: '(11) 97777-6666', email: 'maria@email.com', cpf: '987.654.321-11', observations: 'Necessita de palmilha ortopédica sob medida.' }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Resina Poliéster', quantity: 15, minQuantity: 5, unit: 'L', price: 120.50 },
  { id: 'i2', name: 'Fibra de Carbono', quantity: 2, minQuantity: 3, unit: 'm²', price: 450.00 },
  { id: 'i3', name: 'Velcro 50mm', quantity: 50, minQuantity: 10, unit: 'm', price: 15.00 }
];

export const INITIAL_WORKSHOP: WorkshopOrder[] = [
  { id: 'w1', patientName: 'Carlos Silva', productType: 'Prótese Transtibial', status: 'PRODUCAO', deadline: '2024-06-15', technician: 'João Técnico', description: 'Encaixe em polipropileno' }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', patientName: 'Carlos Silva', date: '2024-05-20', time: '14:00', status: 'PENDENTE', professional: 'Dra. Ana' }
];

export const INITIAL_FINANCE: Transaction[] = [
  { id: 't1', description: 'Venda de Órtese', amount: 1500.00, type: 'RECEITA', date: '2024-05-18', category: 'Vendas' },
  { id: 't2', description: 'Compra de Insumos', amount: 450.00, type: 'DESPESA', date: '2024-05-19', category: 'Estoque' }
];
