import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Client } from '../../models/pages/client.model';
import { ClientStoreService } from '../../services/client-store.service';
import { IconComponent } from '../../shared/icon/icon.component';

type ClientFilter = 'all' | 'pending-measurements' | 'new-this-month';
interface NewClientDraft {
  name: string;
  email: string;
  phone: string;
  location: string;
  birthDate: string;
  preferredFabric: string;
  bust: number | null;
  waist: number | null;
  hip: number | null;
  length: number | null;
  observations: string;
}

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <section class="clients-page" aria-labelledby="clients-title">

      <section class="clients-heading">
        <div>
          <h1 id="clients-title">Clientes</h1>
          <p>Gestão de contatos, medidas corporais e histórico de encomendas</p>
        </div>
        <button class="primary-button" type="button" (click)="openNewClientForm()">
          <app-icon name="plus" />
          <span>Nova cliente</span>
        </button>
      </section>

      @if (isClientModalOpen) {
        <div class="settings-modal-backdrop clients-modal-backdrop" (click)="closeClientForm()">
          <section
            class="settings-modal clients-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-create-title"
            (click)="$event.stopPropagation()"
          >
            <header class="settings-modal-heading">
              <div>
                <h2 id="client-create-title">{{ editingClient ? 'Editar Dados da Cliente' : 'Cadastrar Nova Cliente' }}</h2>
                <p>{{ editingClient
                  ? 'Atualize os dados cadastrais, medidas corporais e preferências da cliente.'
                  : 'Preencha os dados de contato, medidas e preferências do ateliê.' }}</p>
              </div>
              <button class="settings-modal-close" type="button" [attr.aria-label]="editingClient ? 'Fechar edição' : 'Fechar cadastro'" (click)="closeClientForm()">
                <app-icon name="close" />
              </button>
            </header>
            <form class="settings-modal-form client-create-form" (ngSubmit)="saveClient()">
              <div class="client-create-body">
                <div class="client-form-grid">
                  <label class="client-form-wide">
                    <span class="client-field-label">Nome Completo <span class="client-required">*</span></span>
                    <input name="name" [(ngModel)]="newClient.name" autocomplete="name" placeholder="ex: Dandara dos Santos" required autofocus>
                  </label>
                  <label>
                    <span class="client-field-label">Contato <span class="client-required">*</span></span>
                    <input name="phone" [(ngModel)]="newClient.phone" type="tel" autocomplete="tel" placeholder="(11) 98765-4321" required>
                  </label>
                  <label>
                    <span class="client-field-label">E-mail <small>(opcional)</small></span>
                    <input name="email" [(ngModel)]="newClient.email" type="email" autocomplete="email" placeholder="dandara@exemplo.com.br">
                  </label>
                  <label>
                    Localização
                    <input name="location" [(ngModel)]="newClient.location" autocomplete="address-level2" placeholder="ex: Mooca, São Paulo - SP">
                  </label>
                  <label>
                    Data de Nascimento
                    <input name="birthDate" [(ngModel)]="newClient.birthDate" type="date" autocomplete="bday">
                  </label>
                  <label class="client-form-wide">
                    Tecido de Preferência
                    <input name="preferredFabric" [(ngModel)]="newClient.preferredFabric" placeholder="ex: Wax Holandês, Tricoline, Linho Puro">
                  </label>
                </div>

                <fieldset class="client-measurements">
                  <legend>
                    <span>Medidas Corporais (cm)</span>
                    <small>Valores essenciais para modelagem</small>
                  </legend>
                  <div class="client-measurements-grid">
                    <label>
                      Busto
                      <span class="client-measurement-input">
                        <input name="bust" [(ngModel)]="newClient.bust" type="number" min="0" step="0.1" inputmode="decimal" aria-label="Medida do busto em centímetros">
                        <span class="client-measurement-unit">cm</span>
                      </span>
                    </label>
                    <label>
                      Cintura
                      <span class="client-measurement-input">
                        <input name="waist" [(ngModel)]="newClient.waist" type="number" min="0" step="0.1" inputmode="decimal" aria-label="Medida da cintura em centímetros">
                        <span class="client-measurement-unit">cm</span>
                      </span>
                    </label>
                    <label>
                      Quadril
                      <span class="client-measurement-input">
                        <input name="hip" [(ngModel)]="newClient.hip" type="number" min="0" step="0.1" inputmode="decimal" aria-label="Medida do quadril em centímetros">
                        <span class="client-measurement-unit">cm</span>
                      </span>
                    </label>
                    <label>
                      Comprimento
                      <span class="client-measurement-input">
                        <input name="length" [(ngModel)]="newClient.length" type="number" min="0" step="0.1" inputmode="decimal" aria-label="Medida do comprimento em centímetros">
                        <span class="client-measurement-unit">cm</span>
                      </span>
                    </label>
                  </div>
                </fieldset>

                <label class="client-observations">
                  <span class="client-field-label">Observações ou Restrições de Modelagem <small>(opcional)</small></span>
                  <textarea name="observations" [(ngModel)]="newClient.observations" rows="2" placeholder="ex: Preferência por decote fechado, forro de algodão ou observações de ajuste..."></textarea>
                </label>

                @if (newClientError) {
                  <p class="client-form-error" role="alert">{{ newClientError }}</p>
                }
              </div>
              <footer class="client-modal-actions">
                <button type="button" class="secondary-button" (click)="closeClientForm()">Cancelar</button>
                <button type="submit" class="primary-button">{{ editingClient ? 'Salvar Alterações' : 'Cadastrar' }}</button>
              </footer>
            </form>
          </section>
        </div>
      }

      @if (actionNotice) {
        <p class="clients-notice" role="status">{{ actionNotice }}</p>
      }

      @if (selectedClient) {
        <div class="settings-modal-backdrop clients-modal-backdrop" (click)="closeClientDetails()">
          <section
            class="settings-modal clients-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-details-title"
            (click)="$event.stopPropagation()"
          >
            <header class="clients-details-heading">
              <div>
                <h2 id="client-details-title">{{ selectedClient.name }}</h2>
                <p>Dados pessoais, medidas e histórico disponível da cliente.</p>
              </div>
              <button class="settings-modal-close" type="button" aria-label="Fechar detalhes" (click)="closeClientDetails()">
                <app-icon name="close" />
              </button>
            </header>

            <div class="clients-details-content">
              <section class="clients-details-section" aria-labelledby="client-personal-heading">
                <h3 id="client-personal-heading">Dados pessoais e contato</h3>
                <div class="clients-details-cards">
                  <article class="client-detail-card">
                    <small>WhatsApp / Telefone</small>
                    <strong>{{ selectedClient.phone }}</strong>
                  </article>
                  <article class="client-detail-card">
                    <small>E-mail</small>
                    <strong>{{ selectedClient.email || 'Não informado' }}</strong>
                  </article>
                  <article class="client-detail-card">
                    <small>Data de nascimento</small>
                    <strong>{{ formatBirthDate(selectedClient.birthDate) }}</strong>
                  </article>
                  <article class="client-detail-card">
                    <small>Total de pedidos</small>
                    <strong>{{ selectedClient.orders }} {{ selectedClient.orders === 1 ? 'pedido realizado' : 'pedidos realizados' }}</strong>
                  </article>
                </div>
              </section>

              <section class="clients-details-section" aria-labelledby="client-location-heading">
                <h3 id="client-location-heading">Endereço de entrega e provas</h3>
                <article class="client-detail-card client-detail-location">
                  <small>Localização</small>
                  <strong>{{ selectedClient.location || 'Não informada' }}</strong>
                </article>
              </section>

              <section class="clients-details-section" aria-labelledby="client-measurements-heading">
                <div class="clients-details-section-heading">
                  <h3 id="client-measurements-heading">Ficha técnica e medidas corporais</h3>
                  <span class="client-detail-measurement-status" [class.pending]="selectedClient.measurementStatus === 'Pendente Medição'">
                    <app-icon [name]="selectedClient.measurementStatus === 'Atualizadas' ? 'ready' : 'alert'" />
                    {{ selectedClient.measurementStatus }}
                  </span>
                </div>
                <div class="client-detail-measurements">
                  <article class="client-detail-measurement">
                    <small>Busto</small>
                    <strong>{{ selectedClient.measurements?.bust ?? 0 }}<span> cm</span></strong>
                  </article>
                  <article class="client-detail-measurement">
                    <small>Cintura</small>
                    <strong>{{ selectedClient.measurements?.waist ?? 0 }}<span> cm</span></strong>
                  </article>
                  <article class="client-detail-measurement">
                    <small>Quadril</small>
                    <strong>{{ selectedClient.measurements?.hip ?? 0 }}<span> cm</span></strong>
                  </article>
                  <article class="client-detail-measurement">
                    <small>Comprimento</small>
                    <strong>{{ selectedClient.measurements?.length ?? 0 }}<span> cm</span></strong>
                  </article>
                </div>
              </section>

              <div class="client-detail-preferences">
                <section class="clients-details-section client-detail-card">
                  <h3>Tecidos de preferência</h3>
                  <p>{{ selectedClient.preferredFabric || 'Nenhuma preferência cadastrada.' }}</p>
                </section>
                <section class="clients-details-section client-detail-card">
                  <h3>Observações e restrições de modelagem</h3>
                  <p>{{ selectedClient.observations || 'Nenhuma observação cadastrada.' }}</p>
                </section>
              </div>

              <section class="clients-details-section" aria-labelledby="client-orders-heading">
                <div class="clients-details-section-heading">
                  <h3 id="client-orders-heading">Histórico de encomendas &amp; peças</h3>
                  @if (selectedClient.orderHistory?.length) {
                    <span class="client-detail-total-invested">
                      Total investido: <strong>{{ formatCurrency(getClientOrderTotal(selectedClient)) }}</strong>
                    </span>
                  }
                </div>
                <div class="client-detail-orders-wrap">
                  <table class="client-detail-orders-table">
                    <thead>
                      <tr>
                        <th scope="col">Pedido / Peça</th>
                        <th scope="col">Tecido / Cor</th>
                        <th scope="col">Valor</th>
                        <th scope="col">Data da encomenda</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (order of selectedClient.orderHistory ?? []; track order.id) {
                        <tr>
                          <td class="client-order-piece"><strong>#{{ order.id }}</strong> · {{ order.piece }}</td>
                          <td>{{ order.fabricColor }}</td>
                          <td class="client-order-value">{{ formatCurrency(order.value) }}</td>
                          <td>{{ order.orderDate }}</td>
                          <td>
                            <span class="client-order-status" [class.delivered]="order.status === 'Entregue'">
                              {{ order.status }}
                            </span>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td class="client-order-empty" colspan="5">Nenhum item de histórico individual cadastrado para esta cliente.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
                @if (selectedClient.orderHistory?.length) {
                  <p class="client-detail-orders-note">Itens demonstrativos para visualização do histórico de pedidos.</p>
                }
              </section>
            </div>

            <footer class="client-details-footer">
              <button type="button" class="secondary-button" (click)="closeClientDetails()">Fechar</button>
              <button type="button" class="primary-button" (click)="openEditClient(selectedClient)">
                <app-icon name="edit" />
                Editar Cliente
              </button>
            </footer>
          </section>
        </div>
      }

      <section class="clients-card" aria-label="Lista de clientes">
        <div class="clients-toolbar">
          <label class="clients-search" for="client-search">
            <app-icon name="search" />
            <input
              id="client-search"
              name="clientSearch"
              [(ngModel)]="searchTerm"
              (ngModelChange)="currentPage = 1"
              placeholder="Buscar por nome ou contato..."
              type="search"
            >
          </label>

          <div class="clients-toolbar-filters">
            <div class="clients-tabs" role="group" aria-label="Filtrar clientes">
              <button type="button" [class.active]="activeFilter === 'all'" [attr.aria-pressed]="activeFilter === 'all'" (click)="setFilter('all')">
                Todas ({{ clients.length }})
              </button>
              <button type="button" [class.active]="activeFilter === 'pending-measurements'" [attr.aria-pressed]="activeFilter === 'pending-measurements'" (click)="setFilter('pending-measurements')">
                Medidas pendentes ({{ pendingMeasurementsCount }})
              </button>
              <button type="button" [class.active]="activeFilter === 'new-this-month'" [attr.aria-pressed]="activeFilter === 'new-this-month'" (click)="setFilter('new-this-month')">
                Novas no mês ({{ newThisMonthCount }})
              </button>
            </div>

            <label class="clients-location-filter">
              <span class="visually-hidden">Filtrar por cidade</span>
              <select name="location" [(ngModel)]="selectedLocation" (ngModelChange)="currentPage = 1">
                <option value="">Todas as cidades</option>
                @for (location of locations; track location) {
                  <option [value]="location">{{ location }}</option>
                }
              </select>
              <app-icon name="chevron" />
            </label>
          </div>
        </div>

        <div class="clients-table-wrap">
          <table class="clients-table">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Contato</th>
                <th scope="col">Localização</th>
                <th scope="col" class="clients-orders-heading">Pedidos</th>
                <th scope="col">Última encomenda</th>
                <th scope="col">Ficha de medidas</th>
                <th scope="col" class="clients-actions-heading">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (client of paginatedClients; track client.id) {
                <tr>
                  <td class="clients-name">{{ client.name }}</td>
                  <td class="clients-contact"><span>{{ client.phone }}</span><small>{{ client.email }}</small></td>
                  <td>{{ client.location }}</td>
                  <td class="clients-orders"><strong>{{ client.orders }}</strong><small>{{ client.orders === 1 ? 'peça' : 'peças' }}</small></td>
                  <td>{{ client.lastOrder }}</td>
                  <td>
                    <span class="client-measurement-status" [class.pending]="client.measurementStatus === 'Pendente Medição'">
                      <app-icon [name]="client.measurementStatus === 'Atualizadas' ? 'ready' : 'alert'" />
                      {{ client.measurementStatus }}
                    </span>
                  </td>
                  <td>
                    <div class="clients-row-actions">
                      <button type="button" [attr.aria-label]="'Novo pedido para ' + client.name" title="Novo pedido" (click)="showOrderNotice(client)">
                        <app-icon name="package" />
                      </button>
                      <button type="button" [attr.aria-label]="'Editar dados de ' + client.name" title="Editar dados da cliente" (click)="openEditClient(client)">
                        <app-icon name="edit" />
                      </button>
                      <button type="button" [attr.aria-label]="'Ver detalhes de ' + client.name" title="Ver detalhes da cliente" (click)="openClientDetails(client)">
                        <app-icon name="view" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td class="clients-empty" colspan="7">Nenhuma cliente encontrada com esses filtros.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <footer class="clients-table-footer">
          <p>
            Exibindo <strong>{{ firstVisibleClient }}-{{ lastVisibleClient }}</strong>
            de <strong>{{ filteredClients.length }}</strong>
            {{ filteredClients.length === 1 ? 'cliente cadastrada' : 'clientes cadastradas' }}
          </p>
          @if (pageCount > 1) {
            <nav class="clients-pagination" aria-label="Paginação de clientes">
              <button type="button" [disabled]="currentPage === 1" (click)="changePage(currentPage - 1)">Anterior</button>
              @for (page of pageNumbers; track page) {
                <button type="button" [class.active]="page === currentPage" [attr.aria-current]="page === currentPage ? 'page' : null" (click)="changePage(page)">{{ page }}</button>
              }
              <button type="button" [disabled]="currentPage === pageCount" (click)="changePage(currentPage + 1)">Próxima</button>
            </nav>
          }
        </footer>
      </section>
    </section>
  `
})
export class ClientsPageComponent {
  readonly todayLabel = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  readonly pageSize = 6;

  get clients(): Client[] {
    return this.clientStore.clients;
  }

  set clients(clients: Client[]) {
    this.clientStore.setClients(clients);
  }

  constructor(private readonly clientStore: ClientStoreService) {}

  activeFilter: ClientFilter = 'all';
  searchTerm = '';
  selectedLocation = '';
  currentPage = 1;
  isClientModalOpen = false;
  newClientError = '';
  newClient: NewClientDraft = this.createEmptyDraft();
  actionNotice = '';
  editingClient: Client | null = null;
  selectedClient: Client | null = null;

  get locations(): string[] {
    return [...new Set(this.clients.map((client) => client.location))].sort();
  }

  get pendingMeasurementsCount(): number {
    return this.clients.filter((client) => client.measurementStatus === 'Pendente Medição').length;
  }

  get newThisMonthCount(): number {
    return this.clients.filter((client) => client.newThisMonth).length;
  }

  get filteredClients(): Client[] {
    const term = this.searchTerm.trim().toLocaleLowerCase('pt-BR');

    return this.clients.filter((client) => {
      const matchesSearch = !term || [client.name, client.email, client.phone]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(term));
      const matchesLocation = !this.selectedLocation || client.location === this.selectedLocation;
      const matchesFilter = this.activeFilter === 'all'
        || (this.activeFilter === 'pending-measurements' && client.measurementStatus === 'Pendente Medição')
        || (this.activeFilter === 'new-this-month' && client.newThisMonth);

      return matchesSearch && matchesLocation && matchesFilter;
    });
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredClients.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.pageCount }, (_, index) => index + 1);
  }

  get paginatedClients(): Client[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredClients.slice(start, start + this.pageSize);
  }

  get firstVisibleClient(): number {
    return this.filteredClients.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get lastVisibleClient(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredClients.length);
  }

  setFilter(filter: ClientFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.pageCount);
  }

  openNewClientForm(): void {
    this.editingClient = null;
    this.selectedClient = null;
    this.newClient = this.createEmptyDraft();
    this.isClientModalOpen = true;
    this.newClientError = '';
    this.actionNotice = '';
  }

  openEditClient(client: Client): void {
    this.selectedClient = null;
    this.editingClient = client;
    this.newClient = {
      name: client.name,
      email: client.email,
      phone: client.phone,
      location: client.location === 'Não informada' ? '' : client.location,
      birthDate: client.birthDate ?? '',
      preferredFabric: client.preferredFabric ?? '',
      bust: client.measurements?.bust ?? 0,
      waist: client.measurements?.waist ?? 0,
      hip: client.measurements?.hip ?? 0,
      length: client.measurements?.length ?? 0,
      observations: client.observations ?? ''
    };
    this.isClientModalOpen = true;
    this.newClientError = '';
    this.actionNotice = '';
  }

  closeClientForm(): void {
    this.isClientModalOpen = false;
    this.editingClient = null;
    this.newClientError = '';
    this.newClient = this.createEmptyDraft();
  }

  @HostListener('document:keydown.escape')
  closeClientFormOnEscape(): void {
    if (this.isClientModalOpen) {
      this.closeClientForm();
    } else if (this.selectedClient) {
      this.closeClientDetails();
    }
  }

  saveClient(): void {
    const name = this.newClient.name.trim();
    const email = this.newClient.email.trim();
    const phone = this.newClient.phone.trim();
    const location = this.newClient.location.trim();

    if (!name || !phone) {
      this.newClientError = 'Preencha o nome completo e o contato para salvar os dados.';
      return;
    }

    const measurements = {
      bust: this.newClient.bust,
      waist: this.newClient.waist,
      hip: this.newClient.hip,
      length: this.newClient.length
    };
    const hasCompleteMeasurements = Object.values(measurements).every((value) => value !== null && value > 0);
    const hasAnyMeasurements = Object.values(measurements).some((value) => value !== null && value > 0);
    const measurementStatus = hasCompleteMeasurements
      ? 'Atualizadas'
      : hasAnyMeasurements || this.editingClient?.measurements
        ? 'Pendente Medição'
        : this.editingClient?.measurementStatus ?? 'Pendente Medição';
    const updatedFields = {
      name,
      email,
      phone,
      location: location || 'Não informada',
      initials: this.createInitials(name),
      measurementStatus,
      birthDate: this.newClient.birthDate || undefined,
      preferredFabric: this.newClient.preferredFabric.trim() || undefined,
      measurements: hasAnyMeasurements ? measurements : undefined,
      observations: this.newClient.observations.trim() || undefined
    };

    if (this.editingClient) {
      const editingClientId = this.editingClient.id;
      this.clients = this.clients.map((client) => client.id === editingClientId
        ? { ...client, ...updatedFields }
        : client);
      this.currentPage = Math.min(this.currentPage, this.pageCount);
      this.actionNotice = 'Dados da cliente atualizados com sucesso.';
    } else {
      this.clients = [{
        id: Math.max(0, ...this.clients.map((client) => client.id)) + 1,
        ...updatedFields,
        orders: 0,
        lastOrder: '—',
        newThisMonth: true
      }, ...this.clients];
      this.activeFilter = 'all';
      this.searchTerm = '';
      this.selectedLocation = '';
      this.currentPage = 1;
      this.actionNotice = 'Cliente cadastrada com sucesso.';
    }

    this.newClient = this.createEmptyDraft();
    this.isClientModalOpen = false;
    this.editingClient = null;
    this.newClientError = '';
  }

  showOrderNotice(client: Client): void {
    this.selectedClient = null;
    this.actionNotice = `O cadastro de pedido para ${client.name} será conectado ao fluxo de pedidos.`;
  }

  openClientDetails(client: Client): void {
    this.actionNotice = '';
    this.selectedClient = client;
  }

  closeClientDetails(): void {
    this.selectedClient = null;
  }

  formatBirthDate(birthDate?: string): string {
    if (!birthDate) {
      return 'Não informada';
    }

    const [year, month, day] = birthDate.split('-');
    return year && month && day ? `${day}/${month}/${year}` : birthDate;
  }

  formatCurrency(value: number): string {
    return this.currencyFormatter.format(value);
  }

  getClientOrderTotal(client: Client): number {
    return (client.orderHistory ?? []).reduce((total, order) => total + order.value, 0);
  }

  private createInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR');
  }

  private createEmptyDraft(): NewClientDraft {
    return {
      name: '',
      email: '',
      phone: '',
      location: '',
      birthDate: '',
      preferredFabric: '',
      bust: 0,
      waist: 0,
      hip: 0,
      length: 0,
      observations: ''
    };
  }
}
