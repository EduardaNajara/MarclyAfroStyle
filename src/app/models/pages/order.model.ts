export type OrderStatus = 'Corte & tecido' | '1ª prova realizada' | 'Em produção' | 'Pronto p/ entrega' | 'Entregue' | 'Pago';
export type OrderPriority = 'Prioridade' | 'Normal';
export type OrderFittingStatus = 'Realizada' | 'Agendada' | 'Não agendada';

export interface OrderComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface Order {
  id: string;
  client: string;
  clientId?: number;
  service: string;
  createdAt: string;
  deliveryDate: string;
  status: OrderStatus;
  value: number;
  initials: string;
  comments?: OrderComment[];
}

export interface OrderRecord extends Order {
  priority: OrderPriority;
  firstFittingDate: string;
  fittingStatus: OrderFittingStatus;
  paymentCondition?: string;
  notes?: string;
}
