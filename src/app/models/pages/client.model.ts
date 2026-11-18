import { OrderStatus } from './order.model';

export type ClientMeasurementStatus = 'Atualizadas' | 'Pendente Medição';

export interface ClientOrderHistory {
  id: string;
  piece: string;
  fabricColor: string;
  value: number;
  orderDate: string;
  status: OrderStatus;
}

export interface ClientMeasurements {
  bust: number | null;
  waist: number | null;
  hip: number | null;
  length: number | null;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  orders: number;
  initials: string;
  lastOrder: string;
  measurementStatus: ClientMeasurementStatus;
  newThisMonth: boolean;
  birthDate?: string;
  preferredFabric?: string;
  measurements?: ClientMeasurements;
  observations?: string;
  orderHistory?: ClientOrderHistory[];
}
