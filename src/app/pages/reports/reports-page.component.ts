import { Component } from '@angular/core';
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

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [IconComponent],
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
          <button class="primary-button reports-export-button" type="button">
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
                <strong class="report-stat-value">R$ 48.750,00</strong>
                <span class="report-stat-caption report-positive">
                  <app-icon name="trending-up" />
                  Desde a primeira compra
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
                  <input id="revenue-start" type="date" [value]="chartStartDate">
                </div>
                <div class="report-date-field">
                  <label for="revenue-end">Fim</label>
                  <input id="revenue-end" type="date" [value]="currentDate">
                </div>
              </div>
            </div>
          </article>

          <article class="report-stat report-stat-monthly">
            <div class="report-stat-heading">
              <div>
                <span class="report-stat-label">Faturamento mensal</span>
                <strong class="report-stat-value">R$ 6.420,00</strong>
                <span class="report-stat-caption report-positive">
                  <app-icon name="trending-up" />
                  +14% em relação ao mês anterior
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
                  <select id="report-month" aria-label="Mês de referência" [value]="currentMonth">
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
                  <select aria-label="Ano de referência" [value]="currentYear">
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
                <strong class="report-stat-value">48</strong>
                <span class="report-stat-caption">Base total ativa no ateliê</span>
              </div>
              <span class="report-stat-icon">
                <app-icon name="clients" />
              </span>
            </div>
            <div class="report-stat-summary">
              <span><i></i>44 com ficha atualizada</span>
              <strong>4 pendentes</strong>
            </div>
          </article>

          <article class="report-stat report-stat-delivered">
            <div class="report-stat-heading">
              <div>
                <span class="report-stat-label">Pedidos entregues</span>
                <strong class="report-stat-value">124</strong>
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
                <input id="chart-start" type="date" [value]="chartStartDate">
                <label for="chart-end">Até:</label>
                <input id="chart-end" type="date" [value]="currentDate">
                <button class="secondary-button" type="button">Filtrar</button>
              </div>
            </header>

            <div class="report-chart-summary">
              <span>Faturamento anual</span>
              <strong>Faturamento demonstrativo</strong>
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
                      [style.height.%]="item.amount / maxYearlyRevenue * 100">
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
                      <span>{{ client.orders }} pedidos</span>
                    </div>
                    <div class="report-client-track">
                      <span [style.width.%]="client.progress"></span>
                    </div>
                  </div>
                </li>
              }
            </ol>
            <footer class="report-top-clients-footer">
              <span>Calculado no intervalo selecionado</span>
              <strong>Total: 73 pedidos no top 10</strong>
            </footer>
          </article>
        </div>
      </section>
    </main>
  `
})
export class ReportsPageComponent {
  readonly currentDate = this.toDateInputValue(new Date());
  readonly currentDateLabel = new Intl.DateTimeFormat('pt-BR').format(new Date());
  readonly currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  readonly currentYear = new Date().getFullYear();
  readonly chartStartDate = `${this.currentYear - 5}-01-01`;
  readonly reportYears = Array.from({ length: 6 }, (_, index) => this.currentYear - index);
  readonly yearlyRevenue: YearlyRevenue[] = [5800, 9400, 14600, 18900, 21000, 6420]
    .map((amount, index) => ({ year: this.currentYear - 5 + index, amount }));
  readonly maxYearlyRevenue = Math.max(...this.yearlyRevenue.map(({ amount }) => amount));
  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });

  readonly topClients: TopClient[] = [
    { rank: 1, name: 'Beatriz Santos', orders: 14, progress: 100 },
    { rank: 2, name: 'Camila Oliveira', orders: 11, progress: 78 },
    { rank: 3, name: 'Ana Souza', orders: 9, progress: 64 },
    { rank: 4, name: 'Fernanda Costa', orders: 8, progress: 57 },
    { rank: 5, name: 'Jéssica Lima', orders: 7, progress: 50 },
    { rank: 6, name: 'Mariana Silva', orders: 6, progress: 42 },
    { rank: 7, name: 'Juliana Alves', orders: 5, progress: 35 },
    { rank: 8, name: 'Larissa Pereira', orders: 5, progress: 35 },
    { rank: 9, name: 'Gabriela Martins', orders: 4, progress: 28 },
    { rank: 10, name: 'Raquel Andrade', orders: 4, progress: 28 }
  ];

  private toDateInputValue(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  formatCurrency(amount: number): string {
    return this.currencyFormatter.format(amount);
  }
}
