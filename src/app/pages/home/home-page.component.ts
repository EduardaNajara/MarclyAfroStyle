import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardMetric } from '../../models/pages/dashboard.model';
import { Order, OrderRecord, OrderStatus } from '../../models/pages/order.model';
import { OrdersStoreService } from '../../services/orders-store.service';
import { IconComponent } from '../../shared/icon/icon.component';

interface DashboardOrder extends Order {
  priority: 'Prioritário' | 'Normal';
  deliveryIso?: string;
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
        <div class="table-footer"><span>{{ orders.length }} {{ orders.length === 1 ? 'pedido recente' : 'pedidos recentes' }}</span><a routerLink="/pedidos">Ver todos <app-icon name="chevron" /></a></div>
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
          <div class="calendar-heading"><h2 id="calendar-title">Calendário</h2><button type="button" routerLink="/pedidos" aria-label="Abrir pedidos"><app-icon name="chevron" /></button></div>
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
export class HomePageComponent implements OnInit {
  private readonly validStatuses: OrderStatus[] = [
    'Corte & tecido',
    '1ª prova realizada',
    'Em produção',
    'Pronto p/ entrega',
    'Entregue',
    'Pago'
  ];

  orders: DashboardOrder[] = [];
  readonly weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly today = new Date();
  calendarDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

  constructor(private readonly ordersStore: OrdersStoreService) {}

  ngOnInit(): void {
    this.ordersStore.getOrders().subscribe({
      next: (dadosDaApi: any[]) => {
        this.orders = dadosDaApi.map((pedido) => this.mapPedidoToDashboard(pedido));

        const storeRecords: OrderRecord[] = dadosDaApi.map((pedido) => ({
          id: `PED-${String(pedido.idPedido).padStart(3, '0')}`,
          client: pedido.idClienteNavigation?.nomeCompleto || 'Cliente não informada',
          clientId: pedido.idCliente,
          service: pedido.tipoPeca,
          createdAt: this.formatIsoDate(pedido.dataPedido),
          firstFittingDate: pedido.dataSugeridaProva ? this.formatIsoDate(pedido.dataSugeridaProva) : '—',
          fittingStatus: pedido.dataProvaRealizada ? 'Realizada' : (pedido.dataSugeridaProva ? 'Agendada' : 'Não agendada'),
          deliveryDate: this.formatIsoDate(pedido.dataPrevistaEntrega),
          status: this.normalizeStatus(pedido.statusAtual),
          value: Number(pedido.valorTotal ?? 0),
          initials: this.createInitials(pedido.idClienteNavigation?.nomeCompleto || ''),
          priority: pedido.prioridade ? 'Prioridade' : 'Normal',
          paymentCondition: pedido.condicaoPagamento || undefined,
          notes: pedido.detalhesObservacoes || undefined
        }));
        this.ordersStore.setOrders(storeRecords);
      },
      error: (erro) => {
        console.error('Erro ao carregar resumo do dashboard:', erro);
      }
    });
  }

  get metrics(): DashboardMetric[] {
    return [
      { label: 'Total de pedidos', value: this.orders.length, icon: 'orders', tone: 'rose' },
      { label: 'Corte & tecido', value: this.countByStatus('Corte & tecido'), icon: 'scissors', tone: 'gold' },
      { label: '1ª prova realizada', value: this.countByStatus('1ª prova realizada'), icon: 'fitting', tone: 'lilac' },
      { label: 'Em produção', value: this.countByStatus('Em produção'), icon: 'production', tone: 'blue' },
      { label: 'Pronto p/ entrega', value: this.countByStatus('Pronto p/ entrega'), icon: 'ready', tone: 'green' },
      {
        label: 'Entregues',
        value: this.countByStatus('Entregue') + this.countByStatus('Pago'),
        icon: 'package',
        tone: 'peach'
      }
    ];
  }

  get deliveries(): UpcomingDelivery[] {
    const startOfToday = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    let todayCount = 0;
    let nextThreeDaysCount = 0;
    let nextWeekCount = 0;

    for (const order of this.orders) {
      if (!order.deliveryIso || order.status === 'Entregue' || order.status === 'Pago') {
        continue;
      }

      const [year, month, day] = order.deliveryIso.split('-').map(Number);
      const deliveryDate = new Date(year, month - 1, day);
      if (Number.isNaN(deliveryDate.getTime())) {
        continue;
      }

      const diffDays = Math.round((deliveryDate.getTime() - startOfToday.getTime()) / 86400000);

      if (diffDays === 0) {
        todayCount += 1;
      } else if (diffDays >= 1 && diffDays <= 3) {
        nextThreeDaysCount += 1;
      } else if (diffDays >= 4 && diffDays <= 7) {
        nextWeekCount += 1;
      }
    }

    return [
      { label: 'Hoje', count: `${todayCount} ${todayCount === 1 ? 'pedido' : 'pedidos'}`, tone: 'urgent' },
      { label: 'Próximos 3 dias', count: `${nextThreeDaysCount} ${nextThreeDaysCount === 1 ? 'pedido' : 'pedidos'}`, tone: 'soon' },
      { label: 'Próxima semana', count: `${nextWeekCount} ${nextWeekCount === 1 ? 'pedido' : 'pedidos'}`, tone: 'later' }
    ];
  }

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
    const targetYear = this.calendarDate.getFullYear();
    const targetMonth = this.calendarDate.getMonth() + 1;
    const days = new Set<number>();

    for (const order of this.orders) {
      if (!order.deliveryIso) {
        continue;
      }

      const [year, month, day] = order.deliveryIso.split('-').map(Number);
      if (year === targetYear && month === targetMonth && day) {
        days.add(day);
      }
    }

    return [...days].sort((a, b) => a - b);
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

  private countByStatus(status: OrderStatus): number {
    return this.orders.filter((order) => order.status === status).length;
  }

  private mapPedidoToDashboard(pedido: any): DashboardOrder {
    const clientName = pedido.idClienteNavigation?.nomeCompleto || 'Cliente não informada';
    const rawCreatedAt = pedido.dataPedido ? String(pedido.dataPedido).split('T')[0] : '';
    const rawDeliveryDate = pedido.dataPrevistaEntrega ? String(pedido.dataPrevistaEntrega).split('T')[0] : '';

    return {
      id: `PED-${String(pedido.idPedido).padStart(3, '0')}`,
      client: clientName,
      clientId: pedido.idCliente,
      service: pedido.tipoPeca,
      createdAt: this.formatIsoDate(rawCreatedAt),
      deliveryDate: this.formatIsoDate(rawDeliveryDate),
      deliveryIso: rawDeliveryDate || undefined,
      status: this.normalizeStatus(pedido.statusAtual),
      value: Number(pedido.valorTotal ?? 0),
      initials: this.createInitials(clientName),
      priority: pedido.prioridade ? 'Prioritário' : 'Normal'
    };
  }

  private normalizeStatus(rawStatus?: string): OrderStatus {
    return this.validStatuses.includes(rawStatus as OrderStatus)
      ? (rawStatus as OrderStatus)
      : 'Corte & tecido';
  }

  private formatIsoDate(rawDate?: string): string {
    if (!rawDate) {
      return '—';
    }

    const clean = String(rawDate).split('T')[0];
    const [year, month, day] = clean.split('-');
    return year && month && day ? `${day}/${month}/${year}` : clean;
  }

  private createInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR');
  }
}