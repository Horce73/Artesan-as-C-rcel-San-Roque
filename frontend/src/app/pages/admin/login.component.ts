import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container login-page">
      <div class="login-card">
        <div class="aguayo"></div>
        <div class="login-inner">
          <span class="eyebrow">Panel administrativo</span>
          <h1>Bienvenido de nuevo</h1>
          <p class="text-muted">Gestiona el catálogo, el inventario, la trazabilidad y los pedidos.</p>

          <div *ngIf="errorMsg" class="alert-danger mt-3">
            {{ errorMsg }}
          </div>

          <form (ngSubmit)="onLogin()" class="mt-4">
            <div class="form-group">
              <label class="form-label" for="l-email">Correo electrónico</label>
              <input id="l-email" type="email" class="form-control" [(ngModel)]="email" name="email" required placeholder="admin&#64;sanroque.bo" />
            </div>

            <div class="form-group">
              <label class="form-label" for="l-pass">Contraseña</label>
              <input id="l-pass" type="password" class="form-control" [(ngModel)]="pass" name="pass" required placeholder="••••••••" />
            </div>

            <button type="submit" [disabled]="loading" class="btn btn-primary btn-lg w-100 mt-2">
              {{ loading ? 'Ingresando…' : 'Ingresar' }}
            </button>
          </form>

          <p class="hint-box">
            Credenciales de prueba: <strong>admin&#64;sanroque.bo</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { padding: 4rem 1rem; }
    .login-card {
      max-width: 420px;
      margin: 0 auto;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    .login-inner { padding: 2.25rem 2.25rem 2rem; }
    h1 { font-size: 1.9rem; margin: 0.4rem 0 0.4rem; }
    .hint-box {
      margin-top: 1.5rem;
      padding: 0.75rem 1rem;
      background: var(--bg-sunken);
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-align: center;
    }
  `]
})
export class LoginComponent {
  email = 'admin@sanroque.bo';
  pass = 'admin123';
  loading = false;
  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onLogin(): void {
    this.loading = true;
    this.errorMsg = '';

    this.authService.login({ email: this.email, pass: this.pass }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Credenciales incorrectas o usuario inactivo';
      },
    });
  }
}
