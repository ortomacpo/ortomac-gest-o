
export type UserRole = 'GESTOR' | 'FISIOTERAPEUTA' | 'RECEPCIONISTA' | 'TECNICO_ORTOPEDICO';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  observations: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
  professional: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'RECEITA' | 'DESPESA';
  date: string;
  category: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  price: number;
}

export interface WorkshopOrder {
  id: string;
  patientName: string;
  productType: string;
  status: 'PRODUCAO' | 'AJUSTE' | 'FINALIZADO' | 'ENTREGUE';
  deadline: string;
  technician: string;
  description: string;
}

export interface AppState {
  currentUser: User | null;
  patients: Patient[];
  appointments: Appointment[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  workshopOrders: WorkshopOrder[];
}
