import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Client } from '../../models/pages/client.model';
import { OrderComment, OrderFittingStatus, OrderPriority, OrderRecord, OrderStatus } from '../../models/pages/order.model';
import { IconComponent } from '../../shared/icon/icon.component';
import { ClientStoreService } from '../../services/client-store.service';
import { OrdersStoreService } from '../../services/orders-store.service';

type OrderStatusFilter = 'Todos' | 'Em andamento' | OrderStatus;

interface NewOrderDraft {
  client: string;
  service: string;
  value: number | null;
  paymentCondition: string;
  firstFittingDate: string;
  createdAt: string;
  deliveryDate: string;
  priority: OrderPriority;
  status: OrderStatus;
  notes: string;
}

interface OrderDetailDraft {
  status: OrderStatus;
  deliveryDate: string;
  firstFittingDate: string;
  fittingStatus: OrderRecord['fittingStatus'];
  priority: OrderPriority;
  paymentCondition: string;
  notes: string;
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <section class="orders-page" aria-labelledby="orders-title">
      <header class="orders-heading">
        <div>
          <h1 id="orders-title">Pedidos do Ateliê</h1>
          <p>Acompanhe o fluxo de confecção, prazos de entrega e provas presenciais.</p>
        </div>
        <button class="primary-button orders-new-button" type="button" (click)="openNewOrderModal()">
          <app-icon name="plus" />
          Novo Pedido
        </button>
      </header>

      @if (isNewOrderModalOpen) {
        <div class="settings-modal-backdrop orders-modal-backdrop" (click)="closeNewOrderModal()">
          <section
            class="settings-modal orders-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-order-title"
            (click)="$event.stopPropagation()"
          >
            <header class="orders-modal-heading">
              <div>
                <h2 id="new-order-title">Novo Pedido</h2>
                <p>Vincule uma cliente e preencha os detalhes da encomenda</p>
              </div>
              <button class="settings-modal-close" type="button" aria-label="Fechar cadastro de pedido" (click)="closeNewOrderModal()">
                <app-icon name="close" />
              </button>
            </header>

            <form class="orders-create-form" (ngSubmit)="saveNewOrder()">
              <div class="orders-create-body">
                <section class="orders-form-section">
                  <h3>Cliente</h3>
                  <label class="orders-form-label orders-client-select">
                    <span class="visually-hidden">Selecionar cliente</span>
                    <select name="newOrderClient" [(ngModel)]="newOrder.client" required>
                      <option value="" disabled>Selecione uma cliente</option>
                      @for (client of clientOptions; track client.id) {
                        <option [value]="client.name">{{ client.initials }} · {{ client.name }} · {{ client.orders }} {{ client.orders === 1 ? 'pedido anterior' : 'pedidos anteriores' }}</option>
                      }
                    </select>
                    <app-icon name="chevron" />
                  </label>
                </section>

                <section class="orders-form-section">
                  <h3>Serviço &amp; peça</h3>
                  <div class="orders-form-grid">
                    <label class="orders-form-label">
                      <span>Tipo de peça / serviço <i>*</i></span>
                      <input name="newOrderService" [(ngModel)]="newOrder.service" placeholder="Ex.: Vestido sob medida" required>
                    </label>
                    <label class="orders-form-label">
                      <span>Valor do serviço (R$) <i>*</i></span>
                      <span class="orders-value-input"><span>R$</span><input name="newOrderValue" [(ngModel)]="newOrder.value" type="number" min="0.01" step="0.01" placeholder="0,00" required></span>
                    </label>
                    <label class="orders-form-label">
                      <span>Condição de pagamento</span>
                      <span class="orders-select-input">
                        <select name="newOrderPayment" [(ngModel)]="newOrder.paymentCondition">
                          <option value="50% Entrada paga">50% Entrada paga</option>
                          <option value="Pagamento integral">Pagamento integral</option>
                          <option value="Pagamento na entrega">Pagamento na entrega</option>
                          <option value="A combinar">A combinar</option>
                        </select>
                        <app-icon name="chevron" />
                      </span>
                    </label>
                    <label class="orders-form-label">
                      <span>Data sugerida para 1ª prova</span>
                      <input name="newOrderFittingDate" [(ngModel)]="newOrder.firstFittingDate" type="date">
                    </label>
                  </div>
                </section>

                <section class="orders-form-section">
                  <div class="orders-form-grid">
                    <label class="orders-form-label">
                      <span>Data do pedido</span>
                      <input name="newOrderCreatedAt" [(ngModel)]="newOrder.createdAt" type="date" required>
                    </label>
                    <label class="orders-form-label">
                      <span>Data prevista de entrega <i>*</i></span>
                      <input name="newOrderDeliveryDate" [(ngModel)]="newOrder.deliveryDate" type="date" required>
                    </label>
                    <fieldset class="orders-priority-field">
                      <legend>Prioridade <i>*</i></legend>
                      <div class="orders-priority-options">
                        <label [class.selected]="newOrder.priority === 'Normal'">
                          <input type="radio" name="newOrderPriority" [(ngModel)]="newOrder.priority" value="Normal">
                          <span>Normal</span>
                        </label>
                        <label [class.selected]="newOrder.priority === 'Prioridade'">
                          <input type="radio" name="newOrderPriority" [(ngModel)]="newOrder.priority" value="Prioridade">
                          <span>Prioritário</span>
                        </label>
                      </div>
                    </fieldset>
                    <label class="orders-form-label">
                      <span>Status inicial <i>*</i></span>
                      <span class="orders-select-input">
                        <select name="newOrderStatus" [(ngModel)]="newOrder.status" required>
                          @for (status of orderStatuses; track status) {
                            <option [value]="status">{{ status }}</option>
                          }
                        </select>
                        <app-icon name="chevron" />
                      </span>
                    </label>
                  </div>
                </section>

                <section class="orders-form-section orders-notes-section">
                  <label class="orders-form-label">
                    <span>Medidas, tecido &amp; observações</span>
                    <textarea name="newOrderNotes" [(ngModel)]="newOrder.notes" rows="3" placeholder="Ex.: Tecido Wax estampado em tons terracota e dourado. Busto: 92 cm, cintura: 74 cm, quadril: 102 cm. Trazer sapatos na 1ª prova."></textarea>
                  </label>
                </section>

                @if (newOrderError) {
                  <p class="orders-form-error" role="alert">{{ newOrderError }}</p>
                }
              </div>
              <footer class="orders-modal-actions">
                <button type="button" class="secondary-button" [disabled]="isSaving" (click)="closeNewOrderModal()">Cancelar</button>
                <button type="submit" class="primary-button" [disabled]="isSaving">
                  {{ isSaving ? 'Cadastrando...' : 'Cadastrar' }}
                </button>
              </footer>
            </form>
          </section>
        </div>
      }

      @if (selectedOrder && orderDetailDraft) {
        <div class="settings-modal-backdrop orders-modal-backdrop" (click)="closeOrderDetails()">
          <section
            class="settings-modal orders-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-title"
            (click)="$event.stopPropagation()"
          >
            <header class="orders-details-heading">
              <span class="orders-details-icon"><app-icon name="package" /></span>
              <div class="orders-details-title">
                <div class="orders-details-badges">
                  <span>Pedido de produção</span>
                  <span class="orders-priority" [class.priority-high]="orderDetailDraft.priority === 'Prioridade'">
                    {{ orderDetailDraft.priority === 'Prioridade' ? 'Prioritário' : 'Normal' }}
                  </span>
                  <span class="orders-status" [class]="'orders-status ' + statusClass(orderDetailDraft.status)">
                    {{ orderDetailDraft.status }}
                  </span>
                </div>
                <h2 id="order-details-title">Pedido #{{ selectedOrder.id }} — {{ selectedOrder.service }}</h2>
              </div>
              <button class="settings-modal-close" type="button" aria-label="Fechar detalhes do pedido" (click)="closeOrderDetails()">
                <app-icon name="close" />
              </button>
            </header>

            <div class="orders-details-content">
              <section class="orders-detail-progress" aria-labelledby="order-progress-title">
                <div class="orders-detail-section-heading">
                  <h3 id="order-progress-title"><app-icon name="orders" /> Progresso de confecção do ateliê</h3>
                  <span>Clique em uma etapa para atualizar o progresso</span>
                </div>
                <div class="orders-progress-track" [style.--progress]="detailProgressPercent + '%'">
                  <span class="orders-progress-line" aria-hidden="true"><span [style.width.%]="detailProgressPercent"></span></span>
                  @for (status of orderStatuses; track status; let index = $index) {
                    <button
                      type="button"
                      class="orders-progress-step"
                      [class.completed]="index < detailProgressIndex"
                      [class.current]="index === detailProgressIndex"
                      [attr.aria-pressed]="orderDetailDraft.status === status"
                      (click)="setOrderProgress(status)"
                    >
                      <span class="orders-progress-dot">
                        @if (index <= detailProgressIndex) {
                          <app-icon name="ready" />
                        } @else {
                          {{ index + 1 }}
                        }
                      </span>
                      <strong>{{ status }}</strong>
                    </button>
                  }
                </div>
              </section>

              <form class="orders-details-form" (ngSubmit)="saveOrderDetails()">
                <div class="orders-details-columns">
                  <div class="orders-details-main">
                    <section class="orders-detail-card orders-detail-client">
                      <div class="orders-detail-section-heading">
                        <h3>Dados da cliente</h3>
                        <span class="orders-client-count">{{ getClientOrderCount(selectedOrder.client) }} pedidos no sistema</span>
                      </div>
                      <div class="orders-client-summary">
                        <span class="orders-client-avatar">{{ getOrderClient(selectedOrder)?.initials ?? selectedOrder.initials }}</span>
                        <div>
                          <strong>{{ getOrderClient(selectedOrder)?.name ?? selectedOrder.client }}</strong>
                          <small>{{ getOrderClient(selectedOrder) ? 'Cadastro de cliente vinculado' : 'Cliente sem cadastro vinculado' }}</small>
                        </div>
                      </div>
                    </section>

                    <section class="orders-detail-card orders-detail-craft">
                      <div class="orders-detail-section-heading"><h3>Ficha técnica da confecção</h3></div>
                      <section class="orders-detail-subsection">
                        <div class="orders-detail-section-heading"><h4>Medidas, tecido &amp; observações</h4></div>
                        <strong class="orders-detail-service">{{ selectedOrder.service }}</strong>
                        <label class="orders-detail-notes">
                          <span class="visually-hidden">Tecido, medidas e observações deste pedido</span>
                          <textarea name="detailNotes" [(ngModel)]="orderDetailDraft.notes" rows="3" placeholder="Registre tecido, medidas específicas da peça e instruções para a confecção."></textarea>
                        </label>
                        @if (orderDetailDraft.paymentCondition) {
                          <div class="orders-detail-note">
                            <span>Condição de pagamento</span>
                            <strong>{{ orderDetailDraft.paymentCondition }}</strong>
                          </div>
                        }
                      </section>

                      <section class="orders-detail-subsection">
                        <div class="orders-detail-section-heading">
                          <h4>Medidas corporais da cliente (cm)</h4>
                          @if (getOrderClient(selectedOrder); as client) {
                            <span class="orders-measurement-status" [class.pending]="client.measurementStatus === 'Pendente Medição'">
                              {{ client.measurementStatus }}
                            </span>
                          }
                        </div>
                        @if (getOrderClient(selectedOrder); as client) {
                          <div class="orders-client-measurements">
                            <article><small>Busto</small><strong>{{ formatMeasurement(client.measurements?.bust) }} <span>cm</span></strong></article>
                            <article><small>Cintura</small><strong>{{ formatMeasurement(client.measurements?.waist) }} <span>cm</span></strong></article>
                            <article><small>Quadril</small><strong>{{ formatMeasurement(client.measurements?.hip) }} <span>cm</span></strong></article>
                            <article><small>Comprimento</small><strong>{{ formatMeasurement(client.measurements?.length) }} <span>cm</span></strong></article>
                          </div>
                        } @else {
                          <p class="orders-detail-empty">Esta cliente ainda não está vinculada a um cadastro com medidas.</p>
                        }
                      </section>

                      <section class="orders-detail-subsection orders-comments-section">
                        <div class="orders-detail-section-heading">
                          <h4>Histórico de comentários &amp; observações</h4>
                          <span>{{ selectedOrder.comments?.length ?? 0 }} {{ (selectedOrder.comments?.length ?? 0) === 1 ? 'registro' : 'registros' }}</span>
                        </div>
                        <div class="orders-comments-list">
                          @for (comment of selectedOrder.comments ?? []; track comment.id) {
                            <article class="orders-comment">
                              <div>
                                <strong>{{ comment.author }}</strong>
                                <time [attr.datetime]="comment.createdAt">{{ formatCommentDate(comment.createdAt) }}</time>
                              </div>
                              <p>{{ comment.message }}</p>
                            </article>
                          } @empty {
                            <p class="orders-detail-empty">Ainda não há notas do ateliê para este pedido.</p>
                          }
                        </div>
                        <label class="orders-comment-input">
                          <span class="visually-hidden">Escrever uma nota do ateliê</span>
                          <textarea name="newAtelierComment" [(ngModel)]="newAtelierComment" rows="2" placeholder="Escreva uma nota do ateliê..."></textarea>
                        </label>
                        @if (commentError) {
                          <p class="orders-comment-error" role="alert">{{ commentError }}</p>
                        }
                        <button type="button" class="orders-add-comment" [disabled]="isAddingComment" (click)="addAtelierComment()">
                          <app-icon name="plus" /> {{ isAddingComment ? 'Salvando nota...' : 'Adicionar nota' }}
                        </button>
                      </section>
                    </section>
                  </div>

                  <aside class="orders-details-side">
                    <section class="orders-detail-card orders-detail-deadlines">
                      <div class="orders-detail-section-heading">
                        <h3>Prazos &amp; provas</h3>
                        <span class="orders-deadline-badge" [class.overdue]="isDeliveryOverdue">
                          {{ deliveryDeadlineLabel }}
                        </span>
                      </div>
                      <div class="orders-detail-date-row">
                        <span><app-icon name="calendar" /> Entrada do pedido</span>
                        <strong>{{ selectedOrder.createdAt }}</strong>
                      </div>
                      <div class="orders-detail-date-row fitting-date">
                        <span><app-icon [name]="orderDetailDraft.fittingStatus === 'Realizada' ? 'ready' : 'calendar'" /> 1ª prova presencial</span>
                        <strong>{{ orderDetailDraft.firstFittingDate || 'Não agendada' }}</strong>
                      </div>
                      <label class="orders-detail-delivery">
                        <span>Data prevista de entrega</span>
                        <input name="detailDeliveryDate" [(ngModel)]="orderDetailDraft.deliveryDate" type="date" required>
                      </label>
                    </section>

                    <section class="orders-detail-card orders-detail-finance">
                      <div class="orders-detail-section-heading">
                        <h3>Resumo financeiro</h3>
                        <span class="orders-payment-badge">{{ orderDetailDraft.paymentCondition || 'Pagamento não informado' }}</span>
                      </div>
                      <div class="orders-finance-row">
                        <span>Confecção sob medida</span>
                        <strong>{{ formatCurrency(selectedOrder.value) }}</strong>
                      </div>
                      <p>Valores de entrada e saldo não estão detalhados neste cadastro.</p>
                    </section>
                  </aside>
                </div>

                @if (isDeleteConfirmationOpen) {
                  <div class="orders-delete-confirm" role="alertdialog" aria-labelledby="delete-order-title">
                    <div>
                      <strong id="delete-order-title">Excluir este pedido?</strong>
                      <p>Essa ação removerá permanentemente o pedido do banco de dados.</p>
                    </div>
                    <div>
                      <button type="button" class="secondary-button" [disabled]="isSaving" (click)="isDeleteConfirmationOpen = false">Manter pedido</button>
                      <button type="button" class="orders-delete-confirm-button" [disabled]="isSaving" (click)="deleteSelectedOrder()">
                        {{ isSaving ? 'Excluindo...' : 'Excluir' }}
                      </button>
                    </div>
                  </div>
                }

                <footer class="orders-details-footer">
                  <button type="button" class="orders-delete-button" [disabled]="isSaving" (click)="isDeleteConfirmationOpen = true">
                    <app-icon name="delete" /> Excluir
                  </button>
                  <button type="button" class="orders-duplicate-button" [disabled]="isSaving" (click)="duplicateSelectedOrder()">
                    <app-icon name="copy" /> Duplicar Modelo
                  </button>
                  <button type="button" class="secondary-button orders-back-button" [disabled]="isSaving" (click)="closeOrderDetails()">Voltar à Listagem</button>
                  <button type="submit" class="primary-button" [disabled]="isSaving">
                    {{ isSaving ? 'Salvando...' : 'Salvar Alterações do Pedido' }}
                  </button>
                </footer>
              </form>
            </div>
          </section>
        </div>
      }

      @if (actionNotice) {
        <p class="orders-notice" role="status">{{ actionNotice }}</p>
      }

      <section class="orders-card" aria-label="Lista de pedidos">
        <div class="orders-toolbar">
          <label class="orders-search" for="order-search">
            <app-icon name="search" />
            <input
              id="order-search"
              name="orderSearch"
              type="search"
              [(ngModel)]="searchTerm"
              (ngModelChange)="currentPage = 1"
              placeholder="Buscar por peça, cliente ou código..."
            >
          </label>

          <div class="orders-filters">
            <label class="orders-filter">
              <span class="visually-hidden">Filtrar por status</span>
              <app-icon name="orders" />
              <select name="orderStatus" [(ngModel)]="selectedStatus" (ngModelChange)="currentPage = 1">
                @for (status of statusFilters; track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
              <app-icon class="orders-filter-chevron" name="chevron" />
            </label>

            <label class="orders-filter">
              <span class="visually-hidden">Filtrar por data de entrega</span>
              <app-icon name="calendar" />
              <select name="deliveryMonth" [(ngModel)]="selectedDeliveryMonth" (ngModelChange)="currentPage = 1">
                <option value="">Todas as datas</option>
                <option value="2026-11">Novembro de 2026</option>
                <option value="2026-12">Dezembro de 2026</option>
              </select>
              <app-icon class="orders-filter-chevron" name="chevron" />
            </label>

            <label class="orders-filter">
              <span class="visually-hidden">Filtrar por prioridade</span>
              <app-icon name="flag" />
              <select name="orderPriority" [(ngModel)]="selectedPriority" (ngModelChange)="currentPage = 1">
                <option value="Todas">Todas</option>
                <option value="Prioridade">Prioridade</option>
                <option value="Normal">Normal</option>
              </select>
              <app-icon class="orders-filter-chevron" name="chevron" />
            </label>
          </div>
        </div>

        <div class="orders-table-wrap">
          <table class="orders-table">
            <thead>
              <tr>
                <th scope="col">Código / Peça</th>
                <th scope="col">Cliente</th>
                <th scope="col">Prioridade</th>
                <th scope="col">Entrada</th>
                <th scope="col">1ª Prova</th>
                <th scope="col">Entrega</th>
                <th scope="col">Status</th>
                <th scope="col" class="orders-actions-heading">Ações</th>
              </tr>
            </thead>
            <tbody>
              @for (order of paginatedOrders; track order.id) {
                <tr>
                  <td class="orders-piece">
                    <small>{{ order.id }}</small>
                    <strong>{{ order.service }}</strong>
                  </td>
                  <td class="orders-client">{{ order.client }}</td>
                  <td><span class="orders-priority" [class.priority-high]="order.priority === 'Prioridade'">{{ order.priority }}</span></td>
                  <td>{{ order.createdAt }}</td>
                  <td class="orders-fitting">
                    <span>{{ order.firstFittingDate }}</span>
                    <small [class.fitting-scheduled]="order.fittingStatus === 'Agendada'">
                      <app-icon [name]="order.fittingStatus === 'Realizada' ? 'ready' : 'calendar'" />
                      {{ order.fittingStatus }}
                    </small>
                  </td>
                  <td>{{ order.deliveryDate }}</td>
                  <td><span class="orders-status" [class]="'orders-status ' + statusClass(order.status)">{{ order.status }}</span></td>
                  <td>
                    <div class="orders-row-actions">
                      <button type="button" [attr.aria-label]="'Visualizar pedido ' + order.id" title="Visualizar pedido" (click)="showOrderDetails(order)">
                        <app-icon name="view" />
                      </button>
                      <button type="button" [attr.aria-label]="'Excluir pedido ' + order.id" title="Excluir pedido" (click)="promptDeleteOrder(order)">
                        <app-icon name="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td class="orders-empty" colspan="8">Nenhum pedido encontrado com esses filtros.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <footer class="orders-table-footer">
          <p>
            Exibindo <strong>{{ firstVisibleOrder }} a {{ lastVisibleOrder }}</strong>
            de <strong>{{ filteredOrders.length }}</strong>
            {{ filteredOrders.length === 1 ? 'pedido' : 'pedidos' }}
          </p>
          @if (pageCount > 1) {
            <nav class="orders-pagination" aria-label="Paginação de pedidos">
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
export class OrdersPageComponent implements OnInit {
  readonly pageSize = 6;
  readonly orderStatuses: OrderStatus[] = [
    'Corte & tecido',
    '1ª prova realizada',
    'Em produção',
    'Pronto p/ entrega',
    'Entregue',
    'Pago'
  ];
  readonly statusFilters: OrderStatusFilter[] = [
    'Todos',
    'Em andamento',
    'Corte & tecido',
    '1ª prova realizada',
    'Em produção',
    'Pronto p/ entrega',
    'Entregue',
    'Pago'
  ];
  searchTerm = '';
  selectedStatus: OrderStatusFilter = 'Todos';
  selectedDeliveryMonth = '';
  selectedPriority = 'Todas';
  currentPage = 1;
  actionNotice = '';
  isNewOrderModalOpen = false;
  isSaving = false;
  isAddingComment = false;
  newOrderError = '';
  newOrder: NewOrderDraft = this.createEmptyOrderDraft();
  selectedOrder: OrderRecord | null = null;
  orderDetailDraft: OrderDetailDraft | null = null;
  isDeleteConfirmationOpen = false;
  newAtelierComment = '';
  commentError = '';

  constructor(
    private readonly clientStore: ClientStoreService,
    private readonly ordersStore: OrdersStoreService
  ) {}

  ngOnInit(): void {
    this.ordersStore.getOrders().subscribe({
      next: (dadosDaApi: any[]) => {
        this.orders = dadosDaApi.map((pedido) => this.mapPedidoFromApi(pedido));
      },
      error: (erro: any) => {
        console.error('Erro ao carregar pedidos do C#:', erro);
      }
    });

    if (this.clientStore.clients.length === 0) {
      this.clientStore.getClients().subscribe({
        next: (clientesApi: any[]) => {
          const mapeadas: Client[] = clientesApi.map((c) => {
            const bust = Number(c.medidaBusto ?? 0);
            const waist = Number(c.medidaCintura ?? 0);
            const hip = Number(c.medidaQuadril ?? 0);
            const length = Number(c.medidaComprimento ?? 0);
            return {
              id: c.idCliente,
              name: c.nomeCompleto,
              email: c.email || 'Não informado',
              phone: c.telefone || '',
              location: c.localizacao || 'Não informada',
              orders: c.pedidos?.length ?? 0,
              initials: this.createInitials(c.nomeCompleto || ''),
              lastOrder: '—',
              measurementStatus: bust > 0 && waist > 0 && hip > 0 && length > 0 ? 'Atualizadas' : 'Pendente Medição',
              newThisMonth: false,
              measurements: { bust, waist, hip, length }
            };
          });
          this.clientStore.setClients(mapeadas);
        },
        error: (erro: any) => {
          console.error('Erro ao carregar clientes para o seletor de pedidos:', erro);
        }
      });
    }
  }

  get orders(): OrderRecord[] {
    return this.ordersStore.orders;
  }

  set orders(orders: OrderRecord[]) {
    this.ordersStore.setOrders(orders);
  }

  get clientOptions(): Client[] {
    return [...this.clientStore.clients].sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
  }

  get filteredOrders(): OrderRecord[] {
    const term = this.searchTerm.trim().toLocaleLowerCase('pt-BR');

    return this.orders.filter((order) => {
      const matchesSearch = !term || [order.id, order.client, order.service]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(term));
      const matchesStatus = this.selectedStatus === 'Todos'
        || (this.selectedStatus === 'Em andamento' && !['Pronto p/ entrega', 'Entregue', 'Pago'].includes(order.status))
        || order.status === this.selectedStatus;
      const matchesMonth = !this.selectedDeliveryMonth
        || this.deliveryMonth(order.deliveryDate) === this.selectedDeliveryMonth;
      const matchesPriority = this.selectedPriority === 'Todas' || order.priority === this.selectedPriority;

      return matchesSearch && matchesStatus && matchesMonth && matchesPriority;
    });
  }

  get paginatedOrders(): OrderRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.pageCount }, (_, index) => index + 1);
  }

  get firstVisibleOrder(): number {
    return this.filteredOrders.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get lastVisibleOrder(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredOrders.length);
  }

  get detailProgressIndex(): number {
    return this.orderDetailDraft ? this.orderStatuses.indexOf(this.orderDetailDraft.status) : -1;
  }

  get detailProgressPercent(): number {
    if (this.detailProgressIndex < 0 || this.orderStatuses.length < 2) {
      return 0;
    }

    return (this.detailProgressIndex / (this.orderStatuses.length - 1)) * 100;
  }

  get daysUntilDelivery(): number | null {
    if (!this.orderDetailDraft?.deliveryDate) {
      return null;
    }

    const [year, month, day] = this.orderDetailDraft.deliveryDate.split('-').map(Number);
    const delivery = new Date(year, month - 1, day);
    if (Number.isNaN(delivery.getTime())) {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((delivery.getTime() - today.getTime()) / 86400000);
  }

  get deliveryDeadlineLabel(): string {
    const days = this.daysUntilDelivery;
    if (days === null) {
      return 'Prazo não informado';
    }
    if (this.orderDetailDraft?.status === 'Entregue' || this.orderDetailDraft?.status === 'Pago') {
      return 'Prazo concluído';
    }
    if (days < 0) {
      return `Vencido há ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`;
    }
    if (days === 0) {
      return 'Entrega hoje';
    }
    return `Faltam ${days} ${days === 1 ? 'dia' : 'dias'}`;
  }

  get isDeliveryOverdue(): boolean {
    return this.daysUntilDelivery !== null
      && this.daysUntilDelivery < 0
      && this.orderDetailDraft?.status !== 'Entregue'
      && this.orderDetailDraft?.status !== 'Pago';
  }

  changePage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.pageCount);
  }

  statusClass(status: OrderStatus): string {
    switch (status) {
      case 'Corte & tecido': return 'orders-cutting';
      case '1ª prova realizada': return 'orders-fitting';
      case 'Em produção': return 'orders-production';
      case 'Pronto p/ entrega': return 'orders-ready';
      case 'Entregue': return 'orders-delivered';
      case 'Pago': return 'orders-paid';
    }
  }

  openNewOrderModal(): void {
    this.actionNotice = '';
    this.newOrderError = '';
    this.newOrder = this.createEmptyOrderDraft();
    this.isNewOrderModalOpen = true;
  }

  closeNewOrderModal(): void {
    this.isNewOrderModalOpen = false;
    this.newOrderError = '';
  }

  @HostListener('document:keydown.escape')
  closeNewOrderModalOnEscape(): void {
    if (this.isNewOrderModalOpen && !this.isSaving) {
      this.closeNewOrderModal();
    } else if (this.selectedOrder && !this.isSaving) {
      this.closeOrderDetails();
    }
  }

  saveNewOrder(): void {
    const selectedClient = this.clientOptions.find((client) => client.name === this.newOrder.client);
    const service = this.newOrder.service.trim();
    const value = Number(this.newOrder.value);

    if (!selectedClient || !service || !Number.isFinite(value) || value <= 0
      || !this.newOrder.createdAt || !this.newOrder.deliveryDate) {
      this.newOrderError = 'Preencha a cliente, o serviço, um valor válido e as datas obrigatórias.';
      return;
    }

    const payload = {
      idCliente: selectedClient.id,
      tipoPeca: service,
      valorTotal: value,
      condicaoPagamento: this.newOrder.paymentCondition,
      dataPedido: this.newOrder.createdAt,
      dataSugeridaProva: this.newOrder.firstFittingDate || null,
      dataPrevistaEntrega: this.newOrder.deliveryDate,
      prioridade: this.newOrder.priority === 'Prioridade',
      statusAtual: this.newOrder.status,
      detalhesObservacoes: this.newOrder.notes.trim() || null
    };

    this.isSaving = true;
    this.newOrderError = '';

    this.ordersStore.createOrder(payload).subscribe({
      next: (pedidoCriado) => {
        const mapeado = this.mapPedidoFromApi(pedidoCriado);
        this.orders = [mapeado, ...this.orders];
        this.selectedStatus = 'Todos';
        this.selectedDeliveryMonth = '';
        this.selectedPriority = 'Todas';
        this.searchTerm = '';
        this.currentPage = 1;
        this.actionNotice = `Pedido ${mapeado.id} cadastrado com sucesso.`;
        this.isSaving = false;
        this.closeNewOrderModal();
      },
      error: (erro) => {
        console.error('Erro ao cadastrar pedido:', erro);
        this.newOrderError = 'Não foi possível cadastrar o pedido no servidor.';
        this.isSaving = false;
      }
    });
  }

  showOrderDetails(order: OrderRecord): void {
    this.actionNotice = '';
    this.selectedOrder = order;
    this.orderDetailDraft = {
      status: order.status,
      deliveryDate: this.parseOrderDate(order.deliveryDate),
      firstFittingDate: order.firstFittingDate === '—' ? '' : this.parseOrderDate(order.firstFittingDate),
      fittingStatus: order.fittingStatus,
      priority: order.priority,
      paymentCondition: order.paymentCondition ?? '',
      notes: order.notes ?? ''
    };
    this.isDeleteConfirmationOpen = false;
    this.newAtelierComment = '';
    this.commentError = '';
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
    this.orderDetailDraft = null;
    this.isDeleteConfirmationOpen = false;
    this.newAtelierComment = '';
    this.commentError = '';
  }

  setOrderProgress(status: OrderStatus): void {
    if (this.orderDetailDraft) {
      this.orderDetailDraft.status = status;
    }
  }

  saveOrderDetails(): void {
    if (!this.selectedOrder || !this.orderDetailDraft) {
      return;
    }

    if (!this.orderDetailDraft.deliveryDate) {
      this.actionNotice = 'Informe a data prevista de entrega para salvar o pedido.';
      return;
    }

    const orderId = this.selectedOrder.id;
    const numericId = this.extractNumericId(orderId);
    const draft = this.orderDetailDraft;
    const existingComments = this.selectedOrder.comments ?? [];

    const payload = {
      idCliente: this.selectedOrder.clientId ?? 0,
      tipoPeca: this.selectedOrder.service,
      valorTotal: this.selectedOrder.value,
      condicaoPagamento: draft.paymentCondition || 'A combinar',
      dataSugeridaProva: draft.firstFittingDate || null,
      dataPrevistaEntrega: draft.deliveryDate,
      prioridade: draft.priority === 'Prioridade',
      statusAtual: draft.status,
      detalhesObservacoes: draft.notes.trim() || null
    };

    this.isSaving = true;

    this.ordersStore.updateOrder(numericId, payload).subscribe({
      next: (pedidoAtualizado) => {
        const mapeado = this.mapPedidoFromApi(pedidoAtualizado);
        this.orders = this.orders.map((order) =>
          order.id === orderId ? { ...mapeado, comments: existingComments } : order
        );
        this.actionNotice = `Alterações do pedido ${orderId} salvas.`;
        this.isSaving = false;
        this.closeOrderDetails();
      },
      error: (erro) => {
        console.error('Erro ao atualizar pedido:', erro);
        this.actionNotice = `Não foi possível salvar as alterações do pedido ${orderId}.`;
        this.isSaving = false;
      }
    });
  }

  duplicateSelectedOrder(): void {
    if (!this.selectedOrder || !this.orderDetailDraft) {
      return;
    }

    const source = this.selectedOrder;
    const details = this.orderDetailDraft;
    this.newOrder = {
      ...this.createEmptyOrderDraft(),
      client: source.client,
      service: source.service,
      value: source.value,
      paymentCondition: details.paymentCondition || 'A combinar',
      priority: details.priority,
      status: 'Corte & tecido',
      notes: details.notes
    };
    this.closeOrderDetails();
    this.actionNotice = '';
    this.newOrderError = '';
    this.isNewOrderModalOpen = true;
  }

  promptDeleteOrder(order: OrderRecord): void {
    this.showOrderDetails(order);
    this.isDeleteConfirmationOpen = true;
  }

  deleteSelectedOrder(): void {
    if (!this.selectedOrder) {
      return;
    }

    const orderId = this.selectedOrder.id;
    const numericId = this.extractNumericId(orderId);
    this.isSaving = true;

    this.ordersStore.deleteOrder(numericId).subscribe({
      next: () => {
        this.orders = this.orders.filter((order) => order.id !== orderId);
        this.currentPage = Math.min(this.currentPage, this.pageCount);
        this.isSaving = false;
        this.closeOrderDetails();
        this.actionNotice = `Pedido ${orderId} excluído com sucesso.`;
      },
      error: (erro) => {
        console.error('Erro ao excluir pedido:', erro);
        this.isSaving = false;
        this.actionNotice = `Não foi possível excluir o pedido ${orderId}.`;
      }
    });
  }

  getClientOrderCount(clientName: string): number {
    return this.orders.filter((order) => order.client === clientName).length;
  }

  getOrderClient(order: OrderRecord): Client | undefined {
    return order.clientId
      ? this.clientStore.clients.find((client) => client.id === order.clientId)
      : this.clientStore.clients.find((client) => client.name.toLocaleLowerCase('pt-BR') === order.client.toLocaleLowerCase('pt-BR'));
  }

  formatMeasurement(value?: number | null): string {
    return value === null || value === undefined ? '—' : String(value);
  }

  formatCommentDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  addAtelierComment(): void {
    if (!this.selectedOrder) {
      return;
    }

    const message = this.newAtelierComment.trim();
    if (!message) {
      this.commentError = 'Escreva uma nota antes de adicionar ao histórico.';
      return;
    }

    const orderId = this.selectedOrder.id;
    const numericId = this.extractNumericId(orderId);
    this.isAddingComment = true;
    this.commentError = '';

    this.ordersStore.addOrderNote(numericId, {
      tipoTag: 'Observação',
      textoComentario: message
    }).subscribe({
      next: (anotacaoCriada) => {
        if (!this.selectedOrder) {
          this.isAddingComment = false;
          return;
        }
        const newComment: OrderComment = {
          id: String(anotacaoCriada.idAnotacao ?? Date.now()),
          author: anotacaoCriada.idUsuarioNavigation?.nomeCompleto || 'Ateliê Marcly',
          message: anotacaoCriada.textoComentario,
          createdAt: anotacaoCriada.dataRegisto || new Date().toISOString()
        };
        const updatedOrder = {
          ...this.selectedOrder,
          comments: [newComment, ...(this.selectedOrder.comments ?? [])]
        };
        this.orders = this.orders.map((order) => order.id === orderId ? updatedOrder : order);
        this.selectedOrder = updatedOrder;
        this.newAtelierComment = '';
        this.isAddingComment = false;
      },
      error: (erro) => {
        console.error('Erro ao salvar anotação do pedido:', erro);
        this.commentError = 'Não foi possível salvar a nota no servidor.';
        this.isAddingComment = false;
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  private mapPedidoFromApi(pedido: any): OrderRecord {
    const clientName = pedido.idClienteNavigation?.nomeCompleto || 'Cliente não informada';
    const rawCreatedAt = pedido.dataPedido ? String(pedido.dataPedido).split('T')[0] : '';
    const rawFittingDate = pedido.dataSugeridaProva ? String(pedido.dataSugeridaProva).split('T')[0] : '';
    const rawDeliveryDate = pedido.dataPrevistaEntrega ? String(pedido.dataPrevistaEntrega).split('T')[0] : '';

    const normalizedStatus: OrderStatus = this.orderStatuses.includes(pedido.statusAtual)
      ? pedido.statusAtual
      : 'Corte & tecido';

    let fittingStatus: OrderFittingStatus = 'Não agendada';
    if (pedido.dataProvaRealizada || ['1ª prova realizada', 'Em produção', 'Pronto p/ entrega', 'Entregue', 'Pago'].includes(normalizedStatus)) {
      fittingStatus = rawFittingDate || pedido.dataProvaRealizada ? 'Realizada' : 'Não agendada';
    } else if (rawFittingDate) {
      fittingStatus = 'Agendada';
    }

    const comments: OrderComment[] = Array.isArray(pedido.pedidoAnotacos)
      ? pedido.pedidoAnotacos.map((a: any) => ({
          id: String(a.idAnotacao),
          author: a.idUsuarioNavigation?.nomeCompleto || 'Ateliê Marcly',
          message: a.textoComentario,
          createdAt: a.dataRegisto
        }))
      : [];

    return {
      id: `PED-${String(pedido.idPedido).padStart(3, '0')}`,
      client: clientName,
      clientId: pedido.idCliente,
      service: pedido.tipoPeca,
      createdAt: rawCreatedAt ? this.formatOrderDate(rawCreatedAt) : '—',
      firstFittingDate: rawFittingDate ? this.formatOrderDate(rawFittingDate) : '—',
      fittingStatus,
      deliveryDate: rawDeliveryDate ? this.formatOrderDate(rawDeliveryDate) : '—',
      status: normalizedStatus,
      value: Number(pedido.valorTotal ?? 0),
      initials: this.createInitials(clientName),
      priority: pedido.prioridade ? 'Prioridade' : 'Normal',
      paymentCondition: pedido.condicaoPagamento || undefined,
      notes: pedido.detalhesObservacoes || undefined,
      comments
    };
  }

  private extractNumericId(formattedId: string): number {
    return Number(formattedId.replace(/\D/g, '')) || 0;
  }

  private createInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR');
  }

  private deliveryMonth(date: string): string {
    const [day, month, year] = date.split('/');
    return `${year}-${month}`;
  }

  private formatOrderDate(date: string): string {
    const [year, month, day] = date.split('-');
    return year && month && day ? `${day}/${month}/${year}` : date;
  }

  private parseOrderDate(date: string): string {
    const [day, month, year] = date.split('/');
    return day && month && year ? `${year}-${month}-${day}` : '';
  }

  private createEmptyOrderDraft(): NewOrderDraft {
    const today = new Date();
    const localDate = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');

    return {
      client: '',
      service: '',
      value: null,
      paymentCondition: '50% Entrada paga',
      firstFittingDate: '',
      createdAt: localDate,
      deliveryDate: '',
      priority: 'Prioridade',
      status: 'Em produção',
      notes: ''
    };
  }
}