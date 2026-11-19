import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientStoreService } from '../../services/client-store.service';
import { OrdersStoreService } from '../../services/orders-store.service';
import { IconComponent } from '../../shared/icon/icon.component';

interface TopClient {
  rank: number;
  name: string;
  orders: number;
  progress: number;
}

interface YearlyRevenue {
  year: number;
  amount: number;
}

interface ReportOrderItem {
  id: number;
  clientId: number;
  clientName: string;
  service: string;
  value: number;
  orderDate: string; // YYYY-MM-DD
  status: string;
}

interface ReportClientItem {
  id: number;
  name: string;
  hasCompleteMeasurements: boolean;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [IconComponent, FormsModule],
  template: `
    <main class="reports-page" aria-labelledby="reports-title">
      <header class="reports-heading">
        <div>
          <h1 id="reports-title">Relatórios e Indicadores</h1>
          <p>Acompanhe métricas financeiras, volume de entregas e fidelidade das clientes.</p>
        </div>
        <div class="reports-heading-actions">
          <div class="reports-updated">
            <app-icon name="calendar" />
            <span>Atualizado em: <strong>{{ currentDateLabel }}</strong></span>
          </div>
          <button class="primary-button reports-export-button" type="button" (click)="exportReport()">
            <app-icon name="download" />
            <span>Exportar relatório</span>
          </button>
        </div>
      </header>

      <section class="reports-section" aria-labelledby="reports-kpi-title">
        <h2 class="reports-section-title" id="reports-kpi-title">Indicadores principais</h2>
        <div class="page-stats report-stats">
          <article class="report-stat report-stat-revenue">
            <div class="report-stat-heading">
              <div>
                <span class="report-stat-label">Faturamento total</span>
                <strong class="report-stat-value">{{ formatFullCurrency(totalRevenue) }}</strong>
                <span class="report-stat-caption report-positive">
                  <app-icon name="trending-up" />
                  {{ filteredRevenueOrdersCount }} {{ filteredRevenueOrdersCount === 1 ? 'pedido pago no período' : 'pedidos pagos no período' }}
                </span>
              </div>
              <span class="report-stat-icon">
                <app-icon name="payments" />
              </span>
            </div>
            <div class="report-stat-filter">
              <span class="report-filter-label">
                <app-icon name="calendar" />
                Período de análise
              </span>
              <div class="report-date-range">
                <div class="report-date-field">
                  <label for="revenue-start">Início</label>
                  <input id="revenue-start" name="revenueStartDate" type="date" [(ngModel)]="revenueStartDate">
                </div>
                <div class="report-date-field">
                  <label for="revenue-end">Fim</label>
                  <input id="revenue-end" name="revenueEndDate" type="date" [(ngModel)]="revenueEndDate">
                </div>
              </div>
            </div>
          </article>

          <article class="report-stat report-stat-monthly">
            <div class="report-stat-heading">
              <div>
                <span class="report-stat-label">Faturamento mensal</span>
                <strong class="report-stat-value">{{ formatFullCurrency(monthlyRevenue) }}</strong>
                <span class="report-stat-caption" [class.report-positive]="monthlyGrowthPercent >= 0">
                  <app-icon name="trending-up" />
                  {{ monthlyComparisonLabel }}
                </span>
              </div>
              <span class="report-stat-icon">
                <app-icon name="calendar" />
              </span>
            </div>
            <div class="report-stat-filter">
              <label class="report-filter-label" for="report-month">
                <app-icon name="filter" />
                Mês e ano de referência
              </label>
              <div class="report-month-controls">
                <div class="report-select-wrap">
                  <select id="report-month" name="selectedMonth" aria-label="Mês de referência" [(ngModel)]="selectedMonth">
                    <option value="01">Janeiro</option>
                    <option value="02">Fevereiro</option>
                    <option value="03">Março</option>
                    <option value="04">Abril</option>
                    <option value="05">Maio</option>
                    <option value="06">Junho</option>
                    <option value="07">Julho</option>
                    <option value="08">Agosto</option>
                    <option value="09">Setembro</option>
                    <option value="10">Outubro</option>
                    <option value="11">Novembro</option>
                    <option value="12">Dezembro</option>
                  </select>
                  <app-icon name="chevron" />
                </div>
                <div class="report-select-wrap report-year-select">
                  <select name="selectedYear" aria-label="Ano de referência" [(ngModel)]="selectedYear">
                    @for (year of reportYears; track year) {
                      <option [value]="year">{{ year }}</option>
                    }
                  </select>
                  <app-icon name="chevron" />
                </div>
              </div>
            </div>
          </article>

          <article class="report-stat report-stat-clients">
            <div class="report-stat-heading">
              <div>
                <span class="report-stat-label">Clientes cadastradas</span>
                <strong class="report-stat-value">{{ clients.length }}</strong>
                <span class="report-stat-caption">Base total ativa no ateliê</span>
              </div>
              <span class="report-stat-icon">
                <app-icon name="clients" />
              </span>
            </div>
            <div class="report-stat-summary">
              <span><i></i>{{ updatedMeasurementsCount }} com ficha atualizada</span>
              <strong>{{ pendingMeasurementsCount }} {{ pendingMeasurementsCount === 1 ? 'pendente' : 'pendentes' }}</strong>
            </div>
          </article>

          <article class="report-stat report-stat-delivered">
            <div class="report-stat-heading">
              <div>
                <span class="report-stat-label">Pedidos entregues</span>
                <strong class="report-stat-value">{{ deliveredOrdersCount }}</strong>
                <span class="report-stat-caption report-positive">
                  <app-icon name="done-all" />
                  Concluídos com sucesso
                </span>
              </div>
              <span class="report-stat-icon">
                <app-icon name="package" />
              </span>
            </div>
          </article>
        </div>
      </section>

      <section class="reports-section" aria-labelledby="reports-charts-title">
        <h2 class="reports-section-title" id="reports-charts-title">Gráficos e visualizações</h2>
        <div class="reports-grid">
          <article class="report-chart report-revenue-chart">
            <header class="report-chart-heading">
              <div>
                <h3><app-icon name="reports" />Evolução do faturamento</h3>
                <p>Receita acumulada e anual ao longo dos anos</p>
              </div>
              <div class="report-chart-filters">
                <label for="chart-start">De:</label>
                <input id="chart-start" name="chartStartInput" type="date" [(ngModel)]="chartStartInput">
                <label for="chart-end">Até:</label>
                <input id="chart-end" name="chartEndInput" type="date" [(ngModel)]="chartEndInput">
                <button class="secondary-button" type="button" (click)="applyChartFilter()">Filtrar</button>
              </div>
            </header>

            <div class="report-chart-summary">
              <span>Faturamento anual (pedidos pagos)</span>
              <strong>Dados reais do ateliê</strong>
            </div>
            <div class="report-bar-chart" role="img" aria-label="Faturamento anual por ano">
              @for (item of yearlyRevenue; track item.year) {
                <div class="report-bar-column">
                  <span class="report-bar-value">
                    {{ formatCurrency(item.amount) }}
                  </span>
                  <div class="report-bar-track">
                    <span
                      class="report-bar"
                      [class.report-bar-current]="item.year === currentYear"
                      [style.height.%]="maxYearlyRevenue > 0 ? (item.amount / maxYearlyRevenue) * 100 : 0">
                    </span>
                  </div>
                  <strong>{{ item.year }}</strong>
                </div>
              }
            </div>
          </article>

          <article class="report-chart report-top-clients">
            <header class="report-chart-heading report-top-clients-heading">
              <div>
                <h3><app-icon name="clients" />Top 10 clientes</h3>
                <p>Ranqueamento por volume de pedidos</p>
              </div>
            </header>
            <ol class="report-client-list">
              @for (client of topClients; track client.name) {
                <li class="report-client-item">
                  <span class="report-client-rank" [class.report-client-rank-top]="client.rank <= 3">
                    {{ client.rank }}
                  </span>
                  <div class="report-client-info">
                    <div class="report-client-summary">
                      <strong>{{ client.name }}</strong>
                      <span>{{ client.orders }} {{ client.orders === 1 ? 'pedido' : 'pedidos' }}</span>
                    </div>
                    <div class="report-client-track">
                      <span [style.width.%]="client.progress"></span>
                    </div>
                  </div>
                </li>
              } @empty {
                <li class="report-client-item">
                  <span>Nenhum pedido registrado no intervalo selecionado.</span>
                </li>
              }
            </ol>
            <footer class="report-top-clients-footer">
              <span>Calculado no intervalo selecionado</span>
              <strong>Total: {{ topClientsTotalOrders }} {{ topClientsTotalOrders === 1 ? 'pedido' : 'pedidos' }} no top 10</strong>
            </footer>
          </article>
        </div>
      </section>
    </main>
  `
})
export class ReportsPageComponent implements OnInit {
  readonly currentDate = this.toDateInputValue(new Date());
  readonly currentDateLabel = new Intl.DateTimeFormat('pt-BR').format(new Date());
  readonly currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  readonly currentYear = new Date().getFullYear();

  revenueStartDate = `${this.currentYear - 5}-01-01`;
  revenueEndDate = this.currentDate;
  selectedMonth = this.currentMonth;
  selectedYear = this.currentYear;

  chartStartInput = `${this.currentYear - 5}-01-01`;
  chartEndInput = this.currentDate;
  appliedChartStart = `${this.currentYear - 5}-01-01`;
  appliedChartEnd = this.currentDate;

  orders: ReportOrderItem[] = [];
  clients: ReportClientItem[] = [];

  private readonly compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });

  private readonly fullCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });

  constructor(
    private readonly ordersStore: OrdersStoreService,
    private readonly clientStore: ClientStoreService
  ) {}

  ngOnInit(): void {
    this.ordersStore.getOrders().subscribe({
      next: (dadosPedidos: any[]) => {
        this.orders = dadosPedidos.map((p) => ({
          id: p.idPedido,
          clientId: p.idCliente,
          clientName: p.idClienteNavigation?.nomeCompleto || 'Cliente não informada',
          service: p.tipoPeca,
          value: Number(p.valorTotal ?? 0),
          orderDate: p.dataPedido ? String(p.dataPedido).split('T')[0] : '',
          status: p.statusAtual || ''
        }));
      },
      error: (erro) => {
        console.error('Erro ao carregar pedidos para relatórios:', erro);
      }
    });

    this.clientStore.getClients().subscribe({
      next: (dadosClientes: any[]) => {
        this.clients = dadosClientes.map((c) => {
          const bust = Number(c.medidaBusto ?? 0);
          const waist = Number(c.medidaCintura ?? 0);
          const hip = Number(c.medidaQuadril ?? 0);
          const length = Number(c.medidaComprimento ?? 0);
          return {
            id: c.idCliente,
            name: c.nomeCompleto,
            hasCompleteMeasurements: bust > 0 && waist > 0 && hip > 0 && length > 0
          };
        });
      },
      error: (erro) => {
        console.error('Erro ao carregar clientes para relatórios:', erro);
      }
    });
  }

  get reportYears(): number[] {
    const years = new Set<number>(
      Array.from({ length: 6 }, (_, index) => this.currentYear - index)
    );
    for (const order of this.orders) {
      const year = Number(order.orderDate.split('-')[0]);
      if (year > 2000) {
        years.add(year);
      }
    }
    return [...years].sort((a, b) => b - a);
  }

  get filteredRevenueOrders(): ReportOrderItem[] {
    return this.orders.filter((order) => {
      if (!order.orderDate || !this.isPaidOrder(order)) {
        return false;
      }
      const afterStart = !this.revenueStartDate || order.orderDate >= this.revenueStartDate;
      const beforeEnd = !this.revenueEndDate || order.orderDate <= this.revenueEndDate;
      return afterStart && beforeEnd;
    });
  }

  get filteredRevenueOrdersCount(): number {
    return this.filteredRevenueOrders.length;
  }

  get totalRevenue(): number {
    return this.filteredRevenueOrders.reduce((sum, order) => sum + order.value, 0);
  }

  get monthlyRevenue(): number {
    const targetPrefix = `${Number(this.selectedYear)}-${this.selectedMonth}`;
    return this.orders
      .filter((order) => this.isPaidOrder(order) && order.orderDate.startsWith(targetPrefix))
      .reduce((sum, order) => sum + order.value, 0);
  }

  get previousMonthRevenue(): number {
    const yearNum = Number(this.selectedYear);
    const monthNum = Number(this.selectedMonth);
    const prevDate = new Date(yearNum, monthNum - 2, 1);
    const prevPrefix = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    return this.orders
      .filter((order) => this.isPaidOrder(order) && order.orderDate.startsWith(prevPrefix))
      .reduce((sum, order) => sum + order.value, 0);
  }

  get monthlyGrowthPercent(): number {
    const prev = this.previousMonthRevenue;
    if (prev <= 0) {
      return this.monthlyRevenue > 0 ? 100 : 0;
    }
    return Math.round(((this.monthlyRevenue - prev) / prev) * 100);
  }

  get monthlyComparisonLabel(): string {
    const prev = this.previousMonthRevenue;
    if (prev <= 0 && this.monthlyRevenue <= 0) {
      return 'Sem pedidos pagos no período';
    }
    if (prev <= 0) {
      return 'Primeiro mês com faturamento pago';
    }
    const sign = this.monthlyGrowthPercent >= 0 ? '+' : '';
    return `${sign}${this.monthlyGrowthPercent}% em relação ao mês anterior`;
  }

  get updatedMeasurementsCount(): number {
    return this.clients.filter((c) => c.hasCompleteMeasurements).length;
  }

  get pendingMeasurementsCount(): number {
    return this.clients.filter((c) => !c.hasCompleteMeasurements).length;
  }

  get deliveredOrdersCount(): number {
    return this.orders.filter((o) => o.status === 'Entregue' || o.status === 'Pago').length;
  }

  get chartOrders(): ReportOrderItem[] {
    return this.orders.filter((order) => {
      if (!order.orderDate) {
        return false;
      }
      const afterStart = !this.appliedChartStart || order.orderDate >= this.appliedChartStart;
      const beforeEnd = !this.appliedChartEnd || order.orderDate <= this.appliedChartEnd;
      return afterStart && beforeEnd;
    });
  }

  get yearlyRevenue(): YearlyRevenue[] {
    const startYear = this.appliedChartStart
      ? Number(this.appliedChartStart.split('-')[0])
      : this.currentYear - 5;
    const endYear = this.appliedChartEnd
      ? Number(this.appliedChartEnd.split('-')[0])
      : this.currentYear;

    const minYear = Math.min(startYear, endYear);
    const maxYear = Math.max(startYear, endYear);
    const totalsByYear = new Map<number, number>();

    for (let y = minYear; y <= maxYear; y += 1) {
      totalsByYear.set(y, 0);
    }

    for (const order of this.chartOrders) {
      if (!this.isPaidOrder(order)) {
        continue;
      }
      const year = Number(order.orderDate.split('-')[0]);
      if (totalsByYear.has(year)) {
        totalsByYear.set(year, (totalsByYear.get(year) ?? 0) + order.value);
      }
    }

    return [...totalsByYear.entries()].map(([year, amount]) => ({ year, amount }));
  }

  get maxYearlyRevenue(): number {
    if (this.yearlyRevenue.length === 0) {
      return 0;
    }
    return Math.max(...this.yearlyRevenue.map((item) => item.amount));
  }

  get topClients(): TopClient[] {
    const countsByClient = new Map<string, number>();

    for (const order of this.chartOrders) {
      countsByClient.set(order.clientName, (countsByClient.get(order.clientName) ?? 0) + 1);
    }

    const sorted = [...countsByClient.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
      .slice(0, 10);

    const maxOrders = sorted.length > 0 ? sorted[0][1] : 1;

    return sorted.map(([name, orders], index) => ({
      rank: index + 1,
      name,
      orders,
      progress: Math.round((orders / maxOrders) * 100)
    }));
  }

  get topClientsTotalOrders(): number {
    return this.topClients.reduce((sum, item) => sum + item.orders, 0);
  }

  applyChartFilter(): void {
    this.appliedChartStart = this.chartStartInput;
    this.appliedChartEnd = this.chartEndInput;
  }

  exportReport(): void {
    const lines: string[] = [
      'RELATÓRIO DO ATELIÊ MARCLY AFRO STYLE',
      `Gerado em;${this.currentDateLabel}`,
      '',
      'INDICADORES PRINCIPAIS',
      `Faturamento total pago (${this.revenueStartDate} a ${this.revenueEndDate});${this.formatFullCurrency(this.totalRevenue)}`,
      `Faturamento mensal pago (${this.selectedMonth}/${this.selectedYear});${this.formatFullCurrency(this.monthlyRevenue)}`,
      `Clientes cadastradas;${this.clients.length}`,
      `Fichas de medidas atualizadas;${this.updatedMeasurementsCount}`,
      `Pedidos entregues/pagos;${this.deliveredOrdersCount}`,
      '',
      'FATURAMENTO ANUAL (PEDIDOS PAGOS)',
      'Ano;Faturamento'
    ];

    for (const item of this.yearlyRevenue) {
      lines.push(`${item.year};${this.formatFullCurrency(item.amount)}`);
    }

    lines.push('', 'TOP 10 CLIENTES', 'Posição;Cliente;Pedidos');
    for (const client of this.topClients) {
      lines.push(`${client.rank};${client.name};${client.orders}`);
    }

    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-marcly-${this.currentDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private isPaidOrder(order: ReportOrderItem): boolean {
    return order.status.trim().toLocaleLowerCase('pt-BR') === 'pago';
  }

  private toDateInputValue(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  formatCurrency(amount: number): string {
    return this.compactCurrencyFormatter.format(amount);
  }

  formatFullCurrency(amount: number): string {
    return this.fullCurrencyFormatter.format(amount);
  }
}