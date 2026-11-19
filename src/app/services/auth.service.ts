import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthenticatedUser {
  idUsuario: number;
  nomeCompleto: string;
  email: string;
  perfilAcesso: string;
  initials: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:5185/api/auth';
  private readonly storageKey = 'marcly_auth_user';

  readonly userSignal = signal<AuthenticatedUser | null>(this.readFromStorage());

  constructor(private readonly http: HttpClient) {}

  login(email: string, senha: string, remember: boolean): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, senha }).pipe(
      tap((response) => {
        const nome = response.nomeCompleto ?? response.NomeCompleto ?? '';
        const perfil = response.perfilAcesso ?? response.PerfilAcesso ?? 'Perfil comum';
        const user: AuthenticatedUser = {
          idUsuario: response.idUsuario ?? response.IdUsuario ?? 0,
          nomeCompleto: nome,
          email: response.email ?? response.Email ?? email,
          perfilAcesso: perfil,
          initials: this.createInitials(nome)
        };
        this.saveUser(user, remember);
      })
    );
  }

  logout(): void {
    this.userSignal.set(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.storageKey);
    }
  }

  getUser(): AuthenticatedUser | null {
    const current = this.userSignal();
    if (current) {
      return current;
    }

    const stored = this.readFromStorage();
    if (stored) {
      this.userSignal.set(stored);
    }
    return stored;
  }

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }

  private saveUser(user: AuthenticatedUser, remember: boolean): void {
    this.userSignal.set(user);
    if (typeof window === 'undefined') {
      return;
    }

    const serialized = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(this.storageKey, serialized);
      sessionStorage.removeItem(this.storageKey);
    } else {
      sessionStorage.setItem(this.storageKey, serialized);
      localStorage.removeItem(this.storageKey);
    }
  }

  private readFromStorage(): AuthenticatedUser | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = localStorage.getItem(this.storageKey) ?? sessionStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  }

  private createInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toLocaleUpperCase('pt-BR'))
      .join('') || 'MA';
  }
}