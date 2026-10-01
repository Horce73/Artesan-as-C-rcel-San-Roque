import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Order } from '../../models/san-roque.models';

@Component({
  selector: 'app-orders-tracker',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container tracker-page">
      <div class="page-header centered">
        <span class="eyebrow">Mi pedido</span>
        <h1>Sigue tu <span class="accent-text">solicitud</span></h1>
        <p>Ingresa tu número de pedido (ej. PED-2026-XXXX) para ver en qué estado se encuentra.</p>
      </div>

      <form (ngSubmit)="track()" class="search-form">
        <input type="text" class="form-control form-control-lg" [(ngModel)]="orderNumber" name="orderNumber" placeholder="Ej. PED-2026-001" required aria-label="Número de pedido" />
        <button type="submit" class="btn btn-primary btn-lg">Buscar</button>
      </form>

      <div *ngIf="searched && !order" class="empty-box result">
        <p>No encontramos ningún pedido con el número <strong>{{ orderNumber }}</strong>.</p>
      </div>

      <article *ngIf="order" class="order-card result">
        <header class="order-header">
          <div>
            <span class="eyebrow">Pedido</span>
            <h2>{{ order.orderNumber }}</h2>
            <p class="text-muted">Solicitado el {{ order.createdAt | date:'longDate' }}</p>
          </div>
          <span class="badge"
            [class.badge-warning]="order.status === 'PENDING'"
            [class.badge-info]="order.status === 'IN_PROCESS' || order.status === 'READY_FOR_PICKUP'"
            [class.badge-success]="order.status === 'COMPLETED'"
            [class.badge-danger]="order.status === 'CANCELLED'">
            {{ statusLabel(order.status) }}
          </span>
        </header>

        <div class="order-details">
          <div>
            <h4>Resumen</h4>
            <div *ngFor="let item of order.items" class="order-item-row">
              <span>{{ item.quantity }} × {{ item.product?.title }}</span>
              <span>Bs. {{ item.unitPrice * item.quantity | number:'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span>Total</span>
              <span>Bs. {{ order.totalAmount | number:'1.2-2' }}</span>
            </div>
          </div>

          <div>
            <h4>Datos de contacto</h4>
            <dl>
              <dt>Nombre</dt><dd>{{ order.customerName }}</dd>
              <dt>Correo</dt><dd>{{ order.customerEmail }}</dd>
              <dt>Teléfono</dt><dd>{{ order.customerPhone }}</dd>
              <ng-container *ngIf="order.customerAddress"><dt>Dirección</dt><dd>{{ order.customerAddress }}</dd></ng-container>
            </dl>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .search-form {
      display: flex;
      gap: 0.75rem;
      max-width: 560px;
      margin: 0 auto;
    }
    .result {
      max-width: 820px;
      margin: 2.5rem auto 0;
    }
    .order-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 2rem;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }
    .order-header h2 { font-size: 1.8rem; margin: 0.2rem 0; }
    .order-details {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2.5rem;
      padding-top: 1.5rem;
    }
    .order-details h4 {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .order-item-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.95rem;
      padding: 0.4rem 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 600;
      border-top: 1px solid var(--border-strong);
      padding-top: 0.6rem;
      margin-top: 0.5rem;
    }
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.4rem 1rem;
      font-size: 0.93rem;
    }
    dt { color: var(--text-muted); }
    dd { word-break: break-word; }
    @media (max-width: 700px) {
      .search-form { flex-direction: column; }
      .order-card { padding: 1.5rem; }
      .order-details { grid-template-columns: 1fr; gap: 1.5rem; }
    }
  `]
})
export class OrdersTrackerComponent implements OnInit {
  orderNumber = '';
  order: Order | null = null;
  searched = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    const queryNumber = this.route.snapshot.queryParams['orderNumber'];
    if (queryNumber) {
      this.orderNumber = queryNumber;
      this.track();
    }
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      IN_PROCESS: 'En proceso',
      READY_FOR_PICKUP: 'Listo para entrega',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }

  track(): void {
    if (!this.orderNumber) return;
    this.searched = true;
    this.apiService.trackOrder(this.orderNumber.trim()).subscribe({
      next: (o) => (this.order = o),
      error: () => (this.order = null),
    });
  }
}
