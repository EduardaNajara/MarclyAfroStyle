import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials } from '../../models/pages/login.model';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <main class="login-page">
      <div class="login-background" aria-hidden="true">
        <div class="login-glow login-glow-warm"></div>
        <div class="login-glow login-glow-lilac"></div>
      </div>

      <div class="login-content">
        <section class="login-card" aria-labelledby="login-title">
          <header class="login-brand-header">
            <div class="login-logo-frame">
              <img class="login-logo" src="src/assets/logo-b.png" alt="Logo Marcly Afro Style">
            </div>
            <h1 id="login-title" class="login-brand-name">Marcly</h1>
            <span class="login-brand-caption">Afro Style</span>
            <p class="login-description">Acesso exclusivo ao sistema de gestão do ateliê</p>
          </header>

          <form class="login-form" (ngSubmit)="login()">
            <div class="login-field">
              <label for="email" class="login-field-label">E-mail</label>
              <div class="login-input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  [(ngModel)]="credentials.email"
                  autocomplete="username"
                  placeholder="seu.email@marclyafrostyle.com.br"
                  required
                  class="login-input"
                >
                <app-icon name="mail" class="login-field-icon" />
              </div>
            </div>

            <div class="login-field">
              <div class="login-password-heading">
                <label for="password" class="login-field-label">Senha</label>
                <button
                  type="button"
                  class="login-recovery"
                  (click)="showRecoveryNotice = !showRecoveryNotice"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div class="login-input-wrap">
                <input
                  id="password"
                  name="password"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="credentials.password"
                  autocomplete="current-password"
                  placeholder="Digite sua senha"
                  required
                  class="login-input"
                >
                <button
                  type="button"
                  class="login-password-toggle"
                  [attr.aria-label]="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  [attr.aria-pressed]="showPassword"
                  (click)="showPassword = !showPassword"
                >
                  <app-icon [name]="showPassword ? 'visibility-off' : 'visibility'" />
                </button>
              </div>
              @if (showRecoveryNotice) {
                <p class="login-recovery-message" role="status">A recuperação de senha não está disponível nesta demonstração.</p>
              }
            </div>

            <label class="login-remember">
              <input
                type="checkbox"
                name="remember"
                [(ngModel)]="credentials.remember"
              >
              <span>Lembrar de mim</span>
            </label>

            @if (errorMessage) {
              <p class="login-error" role="alert">{{ errorMessage }}</p>
            }

            <button type="submit" class="login-submit">
              <span>Entrar</span>
              <app-icon name="arrow-right" />
            </button>
          </form>

          <aside class="login-demo" aria-label="Credenciais de demonstração">
            <p class="login-demo-title">Acesso de demonstração</p>
            <p>E-mail: <code>{{ demoCredentials.email }}</code></p>
            <p>Senha: <code>{{ demoCredentials.password }}</code></p>
          </aside>
        </section>
      </div>
    </main>
  `
})
export class LoginPageComponent {
  private readonly router = inject(Router);

  readonly demoCredentials = {
    email: 'demo@marclyafrostyle.com.br',
    password: 'MarclyDemo2026!'
  };

  credentials: LoginCredentials = { email: '', password: '', remember: false };
  errorMessage = '';
  showPassword = false;
  showRecoveryNotice = false;

  login(): void {
    const email = this.credentials.email.trim().toLowerCase();
    const validCredentials =
      email === this.demoCredentials.email &&
      this.credentials.password === this.demoCredentials.password;

    if (!validCredentials) {
      this.errorMessage = 'E-mail ou senha inválidos.';
      return;
    }

    this.errorMessage = '';
    void this.router.navigateByUrl('/inicio');
  }
}
