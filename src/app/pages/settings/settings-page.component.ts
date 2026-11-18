import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon/icon.component';

type UserRole = 'admin' | 'common';

interface AtelierSettings {
  name: string;
  slogan: string;
  phone: string;
  email: string;
  address: string;
  pixKey: string;
  messageTemplate: string;
}

interface AtelierUser {
  id: number;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
}

interface NewUserDraft {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <section class="settings-page" aria-labelledby="settings-title">
      <header class="settings-page-heading">
        <div>
          <h1 id="settings-title">Configurações do Ateliê</h1>
          <p>Gerencie as informações da marca, dados de contato e usuários com acesso ao sistema.</p>
        </div>
        <div class="settings-heading-actions">
          <button class="primary-button" type="button" (click)="openSettingsModal()">
            <app-icon name="edit" />
            Editar
          </button>
        </div>
      </header>

      @if (notice) {
        <p class="settings-notice" [class.settings-notice-error]="noticeIsError" role="status">
          {{ notice }}
        </p>
      }

      <div class="settings-content-grid">
        <div class="settings-main-column">
          <section class="settings-card" aria-labelledby="atelier-info-title">
            <header class="settings-card-heading">
              <span class="settings-card-icon settings-card-icon-gold">
                <app-icon name="store" />
              </span>
              <div>
                <h2 id="atelier-info-title">Dados do Ateliê &amp; Marca</h2>
                <p>Informações visíveis às clientes e nos orçamentos impressos</p>
              </div>
            </header>

            <dl class="settings-details-grid">
              <div>
                <dt>Nome do ateliê</dt>
                <dd>{{ settings.name }}</dd>
              </div>
              <div>
                <dt>Slogan / Assinatura</dt>
                <dd>{{ settings.slogan }}</dd>
              </div>
              <div>
                <dt>WhatsApp comercial</dt>
                <dd>{{ settings.phone }} <span class="settings-connected">Conectado</span></dd>
              </div>
              <div>
                <dt>E-mail de contato</dt>
                <dd>{{ settings.email }}</dd>
              </div>
              <div class="settings-details-wide">
                <dt>Endereço do ateliê</dt>
                <dd>{{ settings.address }}</dd>
              </div>
              <div class="settings-details-wide">
                <dt>Chave Pix para recebimento de sinais</dt>
                <dd>{{ settings.pixKey }} <span class="settings-pix-badge">Pix ativo</span></dd>
              </div>
            </dl>
          </section>

          <section class="settings-card" aria-labelledby="whatsapp-template-title">
            <header class="settings-card-heading settings-card-heading-between">
              <div class="settings-card-heading-main">
                <span class="settings-card-icon settings-card-icon-green">
                  <app-icon name="chat" />
                </span>
                <div>
                  <h2 id="whatsapp-template-title">Mensagem Automática de Confirmação</h2>
                  <p>Modelo de mensagem para novos pedidos via WhatsApp</p>
                </div>
              </div>
              <label class="settings-toggle" aria-label="Ativar mensagem automática">
                <input type="checkbox" name="messageEnabled" [(ngModel)]="messageEnabled">
                <span></span>
              </label>
            </header>

            <div class="settings-message-preview">
              <span class="settings-field-label">Modelo do texto personalizado</span>
              <p>{{ settings.messageTemplate }}</p>
              <small>Variáveis disponíveis: [Nome da Cliente], [Nome da Peça], [Data da Prova]</small>
            </div>
            <footer class="settings-card-footer">
              <span><app-icon name="ready" /> {{ messageEnabled ? 'Mensagem automática ativada' : 'Mensagem automática desativada' }}</span>
              <button class="secondary-button" type="button" (click)="testWhatsApp()">
                <app-icon name="chat" />
                Testar envio no WhatsApp
              </button>
            </footer>
          </section>
        </div>

        <aside class="settings-card settings-users-card" aria-labelledby="settings-users-title">
          <header class="settings-card-heading settings-users-heading">
            <span class="settings-card-icon settings-card-icon-blue">
              <app-icon name="clients" />
            </span>
            <div class="settings-users-title">
              <h2 id="settings-users-title">Lista de Usuários</h2>
              <p>Usuários com permissões de acesso ao sistema</p>
            </div>
            <button class="settings-add-user" type="button" (click)="openUserModal()">
              <app-icon name="user-plus" />
              <span>Novo</span>
            </button>
          </header>

          <ul class="settings-user-list">
            @for (user of users; track user.id) {
              <li class="settings-user">
                <span class="settings-user-avatar" [class.settings-user-avatar-admin]="user.role === 'admin'">
                  {{ user.initials }}
                </span>
                <div class="settings-user-info">
                  <strong>{{ user.name }}</strong>
                  <span>{{ user.email }}</span>
                </div>
                @if (user.role === 'admin') {
                  <span class="settings-role settings-role-admin">
                    <app-icon name="shield-check" />
                    Administrador
                  </span>
                } @else {
                  <span class="settings-role">Perfil comum</span>
                  <button
                    class="settings-delete-user"
                    type="button"
                    [attr.aria-label]="'Excluir usuário ' + user.name"
                    (click)="removeUser(user)">
                    <app-icon name="delete" />
                  </button>
                }
              </li>
            } @empty {
              <li class="settings-users-empty">Nenhum usuário cadastrado.</li>
            }
          </ul>

          <footer class="settings-users-footer">
            <span>{{ users.length }} {{ users.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados' }}</span>
            <strong><app-icon name="ready" /> Segurança ativa</strong>
          </footer>
        </aside>
      </div>
    </section>

    @if (settingsModalOpen) {
      <div class="settings-modal-backdrop" (click)="closeOnBackdrop($event, 'settings')" (keydown.escape)="closeModals()" tabindex="-1">
        <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="edit-settings-title">
          <header class="settings-modal-heading">
            <div>
              <p class="eyebrow">CONFIGURAÇÕES GERAIS · ATELIÊ</p>
              <h2 id="edit-settings-title">Editar Configurações</h2>
              <p>Atualize as informações do ateliê e a mensagem do WhatsApp.</p>
            </div>
            <button class="settings-modal-close" type="button" aria-label="Fechar" (click)="closeModals()">
              <app-icon name="close" />
            </button>
          </header>

          <form class="settings-modal-form" (ngSubmit)="saveSettings()">
            <section class="settings-modal-section" aria-labelledby="edit-brand-title">
              <h3 id="edit-brand-title"><app-icon name="store" /> Dados do Ateliê &amp; Marca</h3>
              <div class="settings-form-grid">
                <label>
                  Nome do ateliê *
                  <input name="name" [(ngModel)]="settingsDraft.name" required>
                </label>
                <label>
                  Slogan / Assinatura
                  <input name="slogan" [(ngModel)]="settingsDraft.slogan">
                </label>
                <label>
                  WhatsApp comercial *
                  <input name="phone" [(ngModel)]="settingsDraft.phone" type="tel" required>
                </label>
                <label>
                  E-mail de contato *
                  <input name="email" [(ngModel)]="settingsDraft.email" type="email" required>
                </label>
                <label class="settings-form-wide">
                  Endereço do ateliê
                  <input name="address" [(ngModel)]="settingsDraft.address">
                </label>
                <label class="settings-form-wide">
                  Chave Pix para recebimento de sinais
                  <input name="pixKey" [(ngModel)]="settingsDraft.pixKey">
                </label>
              </div>
            </section>

            <section class="settings-modal-section" aria-labelledby="edit-message-title">
              <h3 id="edit-message-title"><app-icon name="chat" /> Mensagem de confirmação</h3>
              <label class="settings-message-input">
                Texto enviado após a criação do pedido
                <textarea name="messageTemplate" [(ngModel)]="settingsDraft.messageTemplate" rows="5"></textarea>
              </label>
              <label class="settings-checkbox">
                <input type="checkbox" name="modalMessageEnabled" [(ngModel)]="messageEnabled">
                Ativar envio automático da mensagem
              </label>
            </section>

            <footer class="settings-modal-actions">
              <button class="secondary-button" type="button" (click)="closeModals()">Cancelar</button>
              <button class="primary-button" type="submit">
                <app-icon name="save" />
                Salvar alterações
              </button>
            </footer>
          </form>
        </section>
      </div>
    }

    @if (userModalOpen) {
      <div class="settings-modal-backdrop" (click)="closeOnBackdrop($event, 'user')" (keydown.escape)="closeModals()" tabindex="-1">
        <section class="settings-modal settings-user-modal" role="dialog" aria-modal="true" aria-labelledby="new-user-title">
          <header class="settings-modal-heading">
            <div>
              <p class="eyebrow">GESTÃO DE ACESSOS · NOVO USUÁRIO</p>
              <h2 id="new-user-title">Cadastrar Novo Usuário</h2>
              <p>Adicione um membro à equipe do ateliê.</p>
            </div>
            <button class="settings-modal-close" type="button" aria-label="Fechar" (click)="closeModals()">
              <app-icon name="close" />
            </button>
          </header>

          <form class="settings-modal-form" (ngSubmit)="addUser()">
            <label>
              Nome completo *
              <input name="newUserName" [(ngModel)]="newUser.name" autocomplete="name" required>
            </label>
            <label>
              E-mail de acesso *
              <input name="newUserEmail" [(ngModel)]="newUser.email" autocomplete="email" type="email" required>
            </label>
            <label>
              Senha de acesso *
              <input name="newUserPassword" [(ngModel)]="newUser.password" autocomplete="new-password" type="password" minlength="8" required>
              <small>Senha provisória para o primeiro acesso.</small>
            </label>
            <label>
              Perfil de acesso
              <select name="newUserRole" [(ngModel)]="newUser.role">
                <option value="common">Perfil comum</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            @if (userFormError) {
              <p class="settings-notice settings-notice-error" role="alert">{{ userFormError }}</p>
            }
            <footer class="settings-modal-actions">
              <button class="secondary-button" type="button" (click)="closeModals()">Cancelar</button>
              <button class="primary-button" type="submit">
                <app-icon name="user-plus" />
                Salvar usuário
              </button>
            </footer>
          </form>
        </section>
      </div>
    }
  `
})
export class SettingsPageComponent {
  readonly currentDateLabel = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  settings: AtelierSettings = {
    name: 'Marcly Afro Style',
    slogan: 'Moda Afro sob medida e elegância',
    phone: '(11) 98452-1102',
    email: 'contato@marclyafrostyle.com.br',
    address: 'Rua das Rendeiras, 240 – Bela Vista, São Paulo – SP',
    pixKey: 'pix@marclyafrostyle.com.br (E-mail)',
    messageTemplate: 'Olá, [Nome da Cliente]! Aqui é a Marcly do Ateliê Marcly Afro Style. Seu pedido do [Nome da Peça] foi confirmado com muito carinho! Sua 1ª prova presencial está pré-agendada para [Data da Prova]. Qualquer dúvida, estou à disposição por aqui.'
  };
  settingsDraft: AtelierSettings = { ...this.settings };
  messageEnabled = true;
  settingsModalOpen = false;
  userModalOpen = false;
  notice = '';
  noticeIsError = false;
  userFormError = '';
  newUser: NewUserDraft = this.createUserDraft();
  users: AtelierUser[] = [
    { id: 1, name: 'Marcly Silva', email: 'marcly@marclyafrostyle.com', initials: 'MS', role: 'admin' },
    { id: 2, name: 'Ana Beatriz', email: 'ana.assistente@marclyafrostyle.com', initials: 'AB', role: 'common' },
    { id: 3, name: 'Lucas Santos', email: 'lucas.costura@marclyafrostyle.com', initials: 'LS', role: 'common' },
    { id: 4, name: 'Daiane Ferreira', email: 'daiane@marclyafrostyle.com.br', initials: 'DF', role: 'common' },
    { id: 5, name: 'Tatiana Souza', email: 'tatiana.vendas@marclyafrostyle.com', initials: 'TS', role: 'common' }
  ];

  openSettingsModal(): void {
    this.settingsDraft = { ...this.settings };
    this.settingsModalOpen = true;
    this.userModalOpen = false;
    this.userFormError = '';
  }

  saveSettings(): void {
    this.settings = { ...this.settingsDraft };
    this.settingsModalOpen = false;
    this.setNotice('Configurações salvas com sucesso.');
  }

  openUserModal(): void {
    this.newUser = this.createUserDraft();
    this.userFormError = '';
    this.userModalOpen = true;
    this.settingsModalOpen = false;
  }

  addUser(): void {
    const name = this.newUser.name.trim();
    const email = this.newUser.email.trim();
    const duplicateEmail = this.users.some((user) => user.email.toLocaleLowerCase('pt-BR') === email.toLocaleLowerCase('pt-BR'));

    if (duplicateEmail) {
      this.userFormError = 'Já existe um usuário cadastrado com este e-mail.';
      return;
    }

    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0].toLocaleUpperCase('pt-BR')).join('');
    const nextId = Math.max(0, ...this.users.map((user) => user.id)) + 1;
    this.users = [...this.users, { id: nextId, name, email, initials, role: this.newUser.role }];
    this.userModalOpen = false;
    this.newUser = this.createUserDraft();
    this.setNotice('Usuário cadastrado com sucesso.');
  }

  removeUser(user: AtelierUser): void {
    if (user.role === 'admin') return;

    this.users = this.users.filter((item) => item.id !== user.id);
    this.setNotice(`Usuário ${user.name} removido.`);
  }

  testWhatsApp(): void {
    this.setNotice('O envio de teste ficará disponível após a integração com a API do WhatsApp.');
  }

  closeModals(): void {
    this.settingsModalOpen = false;
    this.userModalOpen = false;
    this.userFormError = '';
  }

  closeOnBackdrop(event: MouseEvent, modal: 'settings' | 'user'): void {
    if (event.target !== event.currentTarget) return;

    if (modal === 'settings') {
      this.settingsModalOpen = false;
    } else {
      this.userModalOpen = false;
    }
    this.userFormError = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModals();
  }

  private createUserDraft(): NewUserDraft {
    return { name: '', email: '', password: '', role: 'common' };
  }

  private setNotice(message: string): void {
    this.notice = message;
    this.noticeIsError = false;
  }
}
