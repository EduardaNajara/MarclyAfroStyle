import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { IconComponent } from '../shared/icon/icon.component';
import { IconName } from '../shared/icon/icon-name';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [IconComponent, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell flex min-h-screen">
      <aside class="sidebar flex shrink-0 flex-col" aria-label="Menu do ateliê">
        <a class="brand" routerLink="/inicio" aria-label="Marcly Afro Style, início">
          <img class="brand-mark" src="src/assets/logo-w.png" alt="">
          <span class="brand-name">Marcly</span>
          <span class="brand-caption">AFRO STYLE</span>
        </a>
        <nav class="navigation grid gap-1" aria-label="Navegação principal">
          @for (item of navItems; track item.path) {
            <a class="nav-item flex items-center gap-3 rounded-xl px-4 py-2.5" [routerLink]="item.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" [attr.aria-current]="isCurrent(item.path) ? 'page' : null">
              <app-icon class="nav-icon" [name]="item.icon" /><span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="sidebar-account">
          <span
            class="sidebar-profile-avatar"
            role="img"
            [attr.aria-label]="'Perfil de ' + currentUser().nomeCompleto + ', ' + currentUser().perfilAcesso"
            [title]="currentUser().nomeCompleto + ' — ' + currentUser().perfilAcesso"
          >
            {{ currentUser().initials }}
          </span>
          <div class="sidebar-profile-info">
            <strong>{{ currentUser().nomeCompleto }}</strong>
            <span>{{ currentUser().perfilAcesso }}</span>
          </div>
          <button class="sidebar-logout" type="button" aria-label="Sair da conta" title="Sair" (click)="logout()">
            <app-icon name="logout" />
          </button>
        </div>
      </aside>
      <main class="main-content mx-auto w-full min-w-0 px-10 py-8 max-md:px-4 max-md:py-6">
        <router-outlet />
        <footer class="footer"><span>© {{ currentYear }} Marcly Afro Style. Todos os direitos reservados.</span></footer>
      </main>
    </div>
  `
})
export class DashboardLayoutComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly currentYear = new Date().getFullYear();

  readonly currentUser = computed(() => {
    return this.authService.userSignal() ?? {
      idUsuario: 0,
      nomeCompleto: 'Usuário',
      email: '',
      perfilAcesso: 'Perfil comum',
      initials: 'US'
    };
  });

  readonly navItems = [
    { label: 'Início', path: '/inicio', icon: 'home' },
    { label: 'Clientes', path: '/clientes', icon: 'clients' },
    { label: 'Pedidos', path: '/pedidos', icon: 'orders' },
    { label: 'Relatórios', path: '/relatorios', icon: 'reports' },
    { label: 'Configurações', path: '/configuracoes', icon: 'settings' }
  ] satisfies ReadonlyArray<{ label: string; path: string; icon: IconName }>;

  isCurrent(path: string): boolean {
    return typeof window !== 'undefined' && window.location.pathname === path;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }
}