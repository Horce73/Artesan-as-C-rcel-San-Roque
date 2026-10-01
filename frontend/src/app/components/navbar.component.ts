import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="site-header">
      <div class="aguayo"></div>
      <nav class="navbar">
        <div class="container nav-container">
          <a routerLink="/" class="brand">
            <span class="brand-logo">SR</span>
            <span class="brand-text">
              <span class="brand-title">San Roque</span>
              <span class="brand-sub">Artesanías con historia · Sucre</span>
            </span>
          </a>

          <div class="nav-links">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Inicio</a>
            <a routerLink="/catalogo" routerLinkActive="active">Catálogo</a>
            <a routerLink="/trazabilidad" routerLinkActive="active">Trazabilidad</a>
            <a routerLink="/pedidos/rastreo" routerLinkActive="active">Mi pedido</a>
          </div>

          <div class="nav-actions">
            <ng-container *ngIf="authService.currentUser$ | async as user; else loginBtn">
              <a routerLink="/admin/dashboard" class="btn btn-secondary btn-sm">
                <span class="dot-online"></span> {{ user.fullName }}
              </a>
              <button (click)="logout()" class="btn btn-outline btn-sm">Salir</button>
            </ng-container>
            <ng-template #loginBtn>
              <a routerLink="/admin/login" class="admin-link">Acceso admin</a>
            </ng-template>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .site-header {
      position: sticky;
      top: 0;
      z-index: 900;
    }
    .navbar {
      background: rgba(246, 241, 233, 0.92);
      backdrop-filter: saturate(1.2) blur(10px);
      -webkit-backdrop-filter: saturate(1.2) blur(10px);
      border-bottom: 1px solid var(--border-color);
    }
    .nav-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      height: 68px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      color: var(--text-primary);
    }
    .brand:hover { color: var(--text-primary); }
    .brand-logo {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--accent);
      color: #FFF;
      font-family: var(--font-heading);
      font-style: italic;
      font-weight: 500;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .brand-title {
      font-family: var(--font-heading);
      font-weight: 600;
      font-size: 1.2rem;
    }
    .brand-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
      letter-spacing: 0.04em;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-links a {
      color: var(--text-secondary);
      font-size: 0.93rem;
      font-weight: 500;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-full);
      transition: background 0.15s ease, color 0.15s ease;
    }
    .nav-links a:hover {
      color: var(--text-primary);
      background: var(--bg-sunken);
    }
    .nav-links a.active {
      color: var(--accent-dark);
      background: var(--accent-soft);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .admin-link {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .admin-link:hover { color: var(--text-primary); }
    .dot-online {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      display: inline-block;
    }
    @media (max-width: 860px) {
      .nav-container { flex-wrap: wrap; height: auto; padding-top: 0.7rem; padding-bottom: 0.5rem; row-gap: 0.4rem; }
      .nav-links { order: 3; width: 100%; overflow-x: auto; margin: 0 -0.5rem; }
      .nav-links a { white-space: nowrap; }
      .brand-sub { display: none; }
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
