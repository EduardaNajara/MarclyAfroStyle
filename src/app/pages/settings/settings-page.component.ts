import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
                <dd>{{ settings.slogan || '—' }}</dd>
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
                <dd>{{ settings.address || '—' }}</dd>
              </div>
              <div class="settings-details-wide">
                <dt>Chave Pix para recebimento de sinais</dt>
                <dd>{{ settings.pixKey || '—' }} @if (settings.pixKey) { <span class="settings-pix-badge">Pix ativo</span> }</dd>
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
                <input
                  type="checkbox"
                  name="messageEnabled"
                  [(ngModel)]="messageEnabled"
                  (ngModelChange)="onToggleAutoMessage($event)">
                <span></span>
              </label>
            </header>

            <div class="settings-message-preview">
              <span class="settings-field-label">Modelo do texto personalizado</span>
              <p>{{ settings.messageTemplate || 'Nenhum modelo configurado.' }}</p>
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
              <button class="secondary-button" type="button" [disabled]="isSaving" (click)="closeModals()">Cancelar</button>
              <button class="primary-button" type="submit" [disabled]="isSaving">
                <app-icon name="save" />
                {{ isSaving ? 'Salvando...' : 'Salvar alterações' }}
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
              <small>Senha provisória para o primeiro acesso (mínimo 8 caracteres).</small>
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
              <button class="secondary-button" type="button" [disabled]="isSaving" (click)="closeModals()">Cancelar</button>
              <button class="primary-button" type="submit" [disabled]="isSaving">
                <app-icon name="user-plus" />
                {{ isSaving ? 'Salvando...' : 'Salvar usuário' }}
              </button>
            </footer>
          </form>
        </section>
      </div>
    }
  `
})
export class SettingsPageComponent implements OnInit {
  private readonly configApiUrl = 'http://localhost:5185/api/configuracoes';
  private readonly usersApiUrl = 'http://localhost:5185/api/usuarios';

  readonly currentDateLabel = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  settings: AtelierSettings = {
    name: 'Marcly Afro Style',
    slogan: '',
    phone: '',
    email: '',
    address: '',
    pixKey: '',
    messageTemplate: ''
  };
  settingsDraft: AtelierSettings = { ...this.settings };
  messageEnabled = true;
  settingsModalOpen = false;
  userModalOpen = false;
  isSaving = false;
  notice = '';
  noticeIsError = false;
  userFormError = '';
  newUser: NewUserDraft = this.createUserDraft();
  users: AtelierUser[] = [];

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadUsers();
  }

  private loadSettings(): void {
    this.http.get<any>(this.configApiUrl).subscribe({
      next: (data) => {
        this.settings = {
          name: data.nomeAtelie || 'Marcly Afro Style',
          slogan: data.slogan || '',
          phone: data.whatsappComercial || '',
          email: data.emailContato || '',
          address: data.enderecoAtelie || '',
          pixKey: data.chavePix || '',
          messageTemplate: data.msgWhatsappTemplate || ''
        };
        this.messageEnabled = Boolean(data.msgWhatsappAtiva);
      },
      error: (err) => {
        console.error('Erro ao carregar configurações:', err);
        this.setNotice('Não foi possível carregar as configurações do servidor.', true);
      }
    });
  }

  private loadUsers(): void {
    this.http.get<any[]>(this.usersApiUrl).subscribe({
      next: (data) => {
        this.users = data.map((u) => this.mapUsuarioFromApi(u));
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.setNotice('Não foi possível carregar a lista de usuários.', true);
      }
    });
  }

  openSettingsModal(): void {
    this.settingsDraft = { ...this.settings };
    this.settingsModalOpen = true;
    this.userModalOpen = false;
    this.userFormError = '';
  }

  saveSettings(): void {
    const payload = {
      nomeAtelie: this.settingsDraft.name.trim(),
      slogan: this.settingsDraft.slogan.trim(),
      whatsappComercial: this.settingsDraft.phone.trim(),
      emailContato: this.settingsDraft.email.trim(),
      enderecoAtelie: this.settingsDraft.address.trim(),
      chavePix: this.settingsDraft.pixKey.trim(),
      msgWhatsappAtiva: this.messageEnabled,
      msgWhatsappTemplate: this.settingsDraft.messageTemplate.trim()
    };

    this.isSaving = true;

    this.http.put<any>(this.configApiUrl, payload).subscribe({
      next: (updated) => {
        this.settings = {
          name: updated.nomeAtelie,
          slogan: updated.slogan || '',
          phone: updated.whatsappComercial,
          email: updated.emailContato,
          address: updated.enderecoAtelie || '',
          pixKey: updated.chavePix || '',
          messageTemplate: updated.msgWhatsappTemplate || ''
        };
        this.messageEnabled = Boolean(updated.msgWhatsappAtiva);
        this.isSaving = false;
        this.settingsModalOpen = false;
        this.setNotice('Configurações salvas com sucesso.');
      },
      error: (err) => {
        console.error('Erro ao salvar configurações:', err);
        this.isSaving = false;
        this.setNotice(err.error?.message || 'Não foi possível salvar as configurações.', true);
      }
    });
  }

  onToggleAutoMessage(enabled: boolean): void {
    this.http.patch<any>(`${this.configApiUrl}/whatsapp`, { msgWhatsappAtiva: enabled }).subscribe({
      next: () => {
        this.setNotice(enabled ? 'Mensagem automática ativada.' : 'Mensagem automática desativada.');
      },
      error: (err) => {
        console.error('Erro ao atualizar status da mensagem automática:', err);
        this.messageEnabled = !enabled;
        this.setNotice('Não foi possível atualizar o status da mensagem.', true);
      }
    });
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
    const password = this.newUser.password.trim();

    if (!name || !email || password.length < 8) {
      this.userFormError = 'Preencha nome, e-mail e uma senha com pelo menos 8 caracteres.';
      return;
    }

    const payload = {
      nomeCompleto: name,
      email,
      senha: password,
      perfilAcesso: this.newUser.role === 'admin' ? 'Administrador' : 'Perfil comum'
    };

    this.isSaving = true;
    this.userFormError = '';

    this.http.post<any>(this.usersApiUrl, payload).subscribe({
      next: (created) => {
        const mapped = this.mapUsuarioFromApi(created);
        this.users = [...this.users, mapped];
        this.isSaving = false;
        this.userModalOpen = false;
        this.newUser = this.createUserDraft();
        this.setNotice('Usuário cadastrado com sucesso.');
      },
      error: (err) => {
        console.error('Erro ao cadastrar usuário:', err);
        this.isSaving = false;
        this.userFormError = err.error?.message || 'Não foi possível cadastrar o usuário.';
      }
    });
  }

  removeUser(user: AtelierUser): void {
    if (user.role === 'admin') return;

    this.http.delete<void>(`${this.usersApiUrl}/${user.id}`).subscribe({
      next: () => {
        this.users = this.users.filter((item) => item.id !== user.id);
        this.setNotice(`Usuário ${user.name} removido.`);
      },
      error: (err) => {
        console.error('Erro ao remover usuário:', err);
        this.setNotice(err.error?.message || 'Não foi possível remover o usuário.', true);
      }
    });
  }

  testWhatsApp(): void {
    this.setNotice('O envio de teste ficará disponível após a integração com a API do WhatsApp.');
  }

  closeModals(): void {
    if (this.isSaving) return;
    this.settingsModalOpen = false;
    this.userModalOpen = false;
    this.userFormError = '';
  }

  closeOnBackdrop(event: MouseEvent, modal: 'settings' | 'user'): void {
    if (event.target !== event.currentTarget || this.isSaving) return;

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

  private mapUsuarioFromApi(u: any): AtelierUser {
    const name = u.nomeCompleto || '';
    const isAdmin = String(u.perfilAcesso || '').toLocaleLowerCase('pt-BR').includes('admin');
    return {
      id: u.idUsuario,
      name,
      email: u.email,
      initials: this.createInitials(name),
      role: isAdmin ? 'admin' : 'common'
    };
  }

  private createInitials(name: string): string {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toLocaleUpperCase('pt-BR')).join('');
  }

  private createUserDraft(): NewUserDraft {
    return { name: '', email: '', password: '', role: 'common' };
  }

  private setNotice(message: string, isError = false): void {
    this.notice = message;
    this.noticeIsError = isError;
  }
}