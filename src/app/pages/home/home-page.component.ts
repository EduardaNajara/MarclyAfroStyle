import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardMetric } from '../../models/pages/dashboard.model';
import { Order, OrderStatus } from '../../models/pages/order.model';
import { IconComponent } from '../../shared/icon/icon.component';

interface DashboardOrder extends Order {
  priority: 'Prioritário' | 'Normal';
}

interface UpcomingDelivery {
  label: string;
  count: string;
  tone: 'urgent' | 'soon' | 'later';
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [IconComponent, RouterLink],
  template: `
    <header class="topbar mb-7 flex items-start justify-between gap-6">
      <div class="greeting"><h1>Olá, Marcly!</h1><p>Aqui está o resumo das suas demandas de hoje.</p></div>
    </header>

    <section class="metrics mb-6 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6" aria-label="Resumo dos pedidos">
      @for (metric of metrics; track metric.label) {
        <article class="metric-card" [class]="'metric-card ' + metric.tone">
          <div class="metric-heading">
            <app-icon class="metric-icon" [name]="metric.icon" />
            <span>{{ metric.label }}</span>
          </div>
          <strong>{{ metric.value }}</strong>
        </article>
      }
    </section>

    <div class="content-grid dashboard-grid grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(250px,1fr)]">
      <section class="panel orders-panel min-w-0 rounded-2xl p-5" aria-labelledby="orders-title">
        <div class="dashboard-orders-heading mb-4 flex items-center justify-between gap-4"><h2 id="orders-title">Pedidos recentes</h2></div>

        <div
          class="table-wrap dashboard-table-scroll"
          [class.is-scrollable]="orders.length > 6"
          [attr.tabindex]="orders.length > 6 ? 0 : null"
          role="region"
          aria-label="Pedidos recentes"
        >
          <table class="dashboard-table">
            <thead>
              <tr><th scope="col">PEDIDO / CLIENTE</th><th scope="col">SERVIÇO</th><th scope="col">DATA DO PEDIDO</th><th scope="col">ENTREGA</th><th scope="col">PRIORIDADE</th><th scope="col">STATUS</th></tr>
            </thead>
            <tbody>
              @for (order of orders; track order.id) {
                <tr>
                  <td class="dashboard-client"><small>#{{ order.id }}</small><span>{{ order.client }}</span></td>
                  <td>{{ order.service }}</td>
                  <td>{{ order.createdAt }}</td>
                  <td>{{ order.deliveryDate }}</td>
                  <td><span class="priority-badge" [class.priority-high]="order.priority === 'Prioritário'">{{ order.priority }}</span></td>
                  <td><span class="order-status" [class]="'order-status ' + statusClass(order.status)">{{ order.status }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="empty-state">Nenhum pedido encontrado.</td></tr>
              }
            </tbody>
          </table>
        </div>
        <div class="table-footer"><span>{{ orders.length }} pedidos recentes</span><a routerLink="/pedidos">Ver todos <app-icon name="chevron" /></a></div>
      </section>

      <aside class="right-column dashboard-widgets grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1" aria-label="Resumo de entregas e calendário">
        <section class="panel deliveries-panel" aria-labelledby="deliveries-title">
          <h2 id="deliveries-title">Entregas próximas</h2>
          <ul class="delivery-list">
            @for (delivery of deliveries; track delivery.label) {
              <li>
                <a routerLink="/pedidos">
                  <span class="delivery-label"><i [class]="'delivery-dot ' + delivery.tone"></i>{{ delivery.label }}</span>
                  <span class="delivery-count">{{ delivery.count }} <app-icon name="chevron" /></span>
                </a>
              </li>
            }
          </ul>
        </section>

        <section class="panel calendar-panel" aria-labelledby="calendar-title">
          <div class="calendar-heading"><h2 id="calendar-title">Calendário</h2><button type="button" aria-label="Abrir calendário completo"><app-icon name="chevron" /></button></div>
          <div class="calendar-month">
            <button type="button" aria-label="Mês anterior" (click)="changeMonth(-1)"><app-icon class="calendar-arrow previous" name="chevron" /></button>
            <strong>{{ calendarTitle }}</strong>
            <button type="button" aria-label="Próximo mês" (click)="changeMonth(1)"><app-icon class="calendar-arrow" name="chevron" /></button>
          </div>
          <div class="calendar-grid" role="grid" [attr.aria-label]="'Calendário de ' + calendarTitle">
            @for (weekday of weekdays; track weekday) { <span class="calendar-weekday" role="columnheader">{{ weekday }}</span> }
            @for (day of calendarDays; track $index) {
              @if (day === null) {
                <span class="calendar-empty" role="gridcell"></span>
              } @else {
                <span class="calendar-day" [class.calendar-today]="isToday(day)" [class.calendar-delivery]="deliveryDays.includes(day)" role="gridcell">
                  {{ day }}
                  @if (deliveryDays.includes(day)) { <i aria-hidden="true"></i> }
                </span>
              }
            }
          </div>
        </section>
      </aside>
    </div>
  `
})
export class HomePageComponent {
  readonly metrics: DashboardMetric[] = [
    { label: 'Total de pedidos', value: 12, icon: 'orders', tone: 'rose' },
    { label: 'Corte & tecido', value: 2, icon: 'scissors', tone: 'gold' },
    { label: '1ª prova realizada', value: 2, icon: 'fitting', tone: 'lilac' },
    { label: 'Em produção', value: 4, icon: 'production', tone: 'blue' },
    { label: 'Pronto p/ entrega', value: 2, icon: 'ready', tone: 'green' },
    { label: 'Entregues', value: 2, icon: 'package', tone: 'peach' }
  ];
  readonly orders: DashboardOrder[] = [
    { id: 'PED-012', client: 'Ana Beatriz', service: 'Vestido sob medida', createdAt: '12/11/2026', deliveryDate: '21/11/2026', status: 'Em produção', value: 480, initials: 'AB', priority: 'Prioritário' },
    { id: 'PED-011', client: 'Daiane Ferreira', service: 'Conjunto estampado', createdAt: '11/11/2026', deliveryDate: '22/11/2026', status: '1ª prova realizada', value: 360, initials: 'DF', priority: 'Normal' },
    { id: 'PED-010', client: 'Tatiana Souza', service: 'Saia envelope', createdAt: '10/11/2026', deliveryDate: '24/11/2026', status: 'Corte & tecido', value: 220, initials: 'TS', priority: 'Normal' },
    { id: 'PED-009', client: 'Lucas Santos', service: 'Camisa personalizada', createdAt: '09/11/2026', deliveryDate: '25/11/2026', status: 'Pronto p/ entrega', value: 290, initials: 'LS', priority: 'Prioritário' },
    { id: 'PED-008', client: 'Camila Oliveira', service: 'Vestido estampado', createdAt: '08/11/2026', deliveryDate: '15/11/2026', status: 'Entregue', value: 520, initials: 'CO', priority: 'Normal' },
    { id: 'TEST-001', client: 'Beatriz Costa', service: 'Vestido estampado', createdAt: '07/11/2026', deliveryDate: '19/11/2026', status: 'Em produção', value: 450, initials: 'BC', priority: 'Prioritário' },
    { id: 'TEST-002', client: 'Joana Ribeiro', service: 'Blusa sob medida', createdAt: '06/11/2026', deliveryDate: '20/11/2026', status: 'Pago', value: 180, initials: 'JR', priority: 'Normal' },
    { id: 'TEST-003', client: 'Rafaela Mendes', service: 'Saia longa', createdAt: '05/11/2026', deliveryDate: '22/11/2026', status: 'Pago', value: 260, initials: 'RM', priority: 'Normal' },
    { id: 'TEST-004', client: 'Fernanda Lima', service: 'Conjunto africano', createdAt: '04/11/2026', deliveryDate: '24/11/2026', status: 'Pronto p/ entrega', value: 520, initials: 'FL', priority: 'Prioritário' },
    { id: 'TEST-005', client: 'Aline Carvalho', service: 'Camisa social', createdAt: '03/11/2026', deliveryDate: '25/11/2026', status: 'Em produção', value: 340, initials: 'AC', priority: 'Normal' },
    { id: 'TEST-006', client: 'Luana Martins', service: 'Vestido de festa', createdAt: '02/11/2026', deliveryDate: '27/11/2026', status: 'Corte & tecido', value: 610, initials: 'LM', priority: 'Prioritário' },
    { id: 'TEST-007', client: 'Isabela Rocha', service: 'Saia midi', createdAt: '01/11/2026', deliveryDate: '28/11/2026', status: '1ª prova realizada', value: 230, initials: 'IR', priority: 'Normal' },
    { id: 'TEST-008', client: 'Sofia Alves', service: 'Macacão', createdAt: '31/10/2026', deliveryDate: '29/11/2026', status: 'Pronto p/ entrega', value: 490, initials: 'SA', priority: 'Normal' },
    { id: 'TEST-009', client: 'Camila Nunes', service: 'Blazer feminino', createdAt: '30/10/2026', deliveryDate: '30/11/2026', status: 'Em produção', value: 580, initials: 'CN', priority: 'Prioritário' },
    { id: 'TEST-010', client: 'Júlia Fernandes', service: 'Vestido casual', createdAt: '29/10/2026', deliveryDate: '02/12/2026', status: 'Entregue', value: 320, initials: 'JF', priority: 'Normal' }
  ];
  readonly deliveries: UpcomingDelivery[] = [
    { label: 'Hoje', count: '1 pedido', tone: 'urgent' },
    { label: 'Próximos 3 dias', count: '2 pedidos', tone: 'soon' },
    { label: 'Próxima semana', count: '4 pedidos', tone: 'later' }
  ];
  readonly weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly today = new Date();
  calendarDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

  get calendarTitle(): string {
    const title = this.calendarDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return title.charAt(0).toLocaleUpperCase('pt-BR') + title.slice(1);
  }

  get calendarDays(): (number | null)[] {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array.from({ length: offset }, () => null);
    for (let day = 1; day <= dayCount; day += 1) days.push(day);
    return days;
  }

  get deliveryDays(): number[] {
    const isCurrentMonth = this.calendarDate.getFullYear() === this.today.getFullYear()
      && this.calendarDate.getMonth() === this.today.getMonth();
    return isCurrentMonth ? [20, 23, 26, 28] : [];
  }

  statusClass(status: OrderStatus): string {
    return {
      'Corte & tecido': 'cutting',
      '1ª prova realizada': 'fitting',
      'Em produção': 'production',
      'Pronto p/ entrega': 'ready',
      Entregue: 'delivered',
      Pago: 'paid'
    }[status];
  }

  isToday(day: number): boolean {
    return day === this.today.getDate()
      && this.calendarDate.getMonth() === this.today.getMonth()
      && this.calendarDate.getFullYear() === this.today.getFullYear();
  }

  changeMonth(offset: number): void {
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + offset, 1);
  }
}
