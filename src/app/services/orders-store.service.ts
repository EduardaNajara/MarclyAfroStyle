import { Injectable } from '@angular/core';
import { OrderRecord } from '../models/pages/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersStoreService {
  orders: OrderRecord[] = [
    { id: 'PED-012', client: 'Ana Beatriz', service: 'Vestido sob medida', createdAt: '12/11/2026', firstFittingDate: '18/11/2026', fittingStatus: 'Realizada', deliveryDate: '21/11/2026', status: 'Em produção', value: 480, initials: 'AB', priority: 'Prioridade' },
    { id: 'PED-011', client: 'Daiane Ferreira', service: 'Conjunto estampado', createdAt: '11/11/2026', firstFittingDate: '19/11/2026', fittingStatus: 'Agendada', deliveryDate: '22/11/2026', status: '1ª prova realizada', value: 360, initials: 'DF', priority: 'Normal' },
    { id: 'PED-010', client: 'Tatiana Souza', service: 'Saia envelope', createdAt: '10/11/2026', firstFittingDate: '17/11/2026', fittingStatus: 'Realizada', deliveryDate: '24/11/2026', status: 'Corte & tecido', value: 220, initials: 'TS', priority: 'Normal' },
    { id: 'PED-009', client: 'Lucas Santos', service: 'Camisa personalizada', createdAt: '09/11/2026', firstFittingDate: '20/11/2026', fittingStatus: 'Realizada', deliveryDate: '25/11/2026', status: 'Pronto p/ entrega', value: 290, initials: 'LS', priority: 'Prioridade' },
    { id: 'PED-008', client: 'Camila Oliveira', clientId: 2, service: 'Vestido estampado', createdAt: '08/11/2026', firstFittingDate: '10/11/2026', fittingStatus: 'Realizada', deliveryDate: '15/11/2026', status: 'Entregue', value: 520, initials: 'CO', priority: 'Normal' },
    { id: 'TEST-001', client: 'Beatriz Costa', service: 'Vestido estampado', createdAt: '07/11/2026', firstFittingDate: '14/11/2026', fittingStatus: 'Realizada', deliveryDate: '19/11/2026', status: 'Em produção', value: 450, initials: 'BC', priority: 'Prioridade' },
    { id: 'TEST-002', client: 'Joana Ribeiro', service: 'Blusa sob medida', createdAt: '06/11/2026', firstFittingDate: '18/11/2026', fittingStatus: 'Agendada', deliveryDate: '20/11/2026', status: 'Pago', value: 180, initials: 'JR', priority: 'Normal' },
    { id: 'TEST-003', client: 'Rafaela Mendes', service: 'Saia longa', createdAt: '05/11/2026', firstFittingDate: '16/11/2026', fittingStatus: 'Realizada', deliveryDate: '22/11/2026', status: 'Pago', value: 260, initials: 'RM', priority: 'Normal' },
    { id: 'TEST-004', client: 'Fernanda Lima', service: 'Conjunto africano', createdAt: '04/11/2026', firstFittingDate: '18/11/2026', fittingStatus: 'Realizada', deliveryDate: '24/11/2026', status: 'Pronto p/ entrega', value: 520, initials: 'FL', priority: 'Prioridade' },
    { id: 'TEST-005', client: 'Aline Carvalho', service: 'Camisa social', createdAt: '03/11/2026', firstFittingDate: '20/11/2026', fittingStatus: 'Agendada', deliveryDate: '25/11/2026', status: 'Em produção', value: 340, initials: 'AC', priority: 'Normal' },
    { id: 'TEST-006', client: 'Luana Martins', service: 'Vestido de festa', createdAt: '02/11/2026', firstFittingDate: '21/11/2026', fittingStatus: 'Agendada', deliveryDate: '27/11/2026', status: 'Corte & tecido', value: 610, initials: 'LM', priority: 'Prioridade' },
    { id: 'TEST-007', client: 'Isabela Rocha', service: 'Saia midi', createdAt: '01/11/2026', firstFittingDate: '20/11/2026', fittingStatus: 'Agendada', deliveryDate: '28/11/2026', status: '1ª prova realizada', value: 230, initials: 'IR', priority: 'Normal' },
    { id: 'TEST-008', client: 'Sofia Alves', service: 'Macacão', createdAt: '31/10/2026', firstFittingDate: '21/11/2026', fittingStatus: 'Agendada', deliveryDate: '29/11/2026', status: 'Pronto p/ entrega', value: 490, initials: 'SA', priority: 'Normal' },
    { id: 'TEST-009', client: 'Camila Nunes', service: 'Blazer feminino', createdAt: '30/10/2026', firstFittingDate: '23/11/2026', fittingStatus: 'Agendada', deliveryDate: '30/11/2026', status: 'Em produção', value: 580, initials: 'CN', priority: 'Prioridade' },
    { id: 'TEST-010', client: 'Júlia Fernandes', service: 'Vestido casual', createdAt: '29/10/2026', firstFittingDate: '25/11/2026', fittingStatus: 'Agendada', deliveryDate: '02/12/2026', status: 'Entregue', value: 320, initials: 'JF', priority: 'Normal' }
  ];

  setOrders(orders: OrderRecord[]): void {
    this.orders = orders;
  }
}
