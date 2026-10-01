import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { StageLabelPipe } from '../../shared/stage-label.pipe';
import { Product, InventoryBatch, TraceabilityEvent } from '../../models/san-roque.models';
import { ImgFallbackDirective } from '../../shared/img-fallback.directive';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StageLabelPipe, ImgFallbackDirective],
  template: `
    <div class="container detail-page" *ngIf="product">
      <nav class="breadcrumb">
        <a routerLink="/catalogo">Catálogo</a>
        <span>/</span>
        <span>{{ product.category?.name || 'Artesanía' }}</span>
      </nav>

      <div class="detail-main">
        <!-- Galería -->
        <div class="gallery">
          <div class="main-image-wrap">
            <img appImgFallback [src]="activeImage || product.imageUrls?.[0] || ''" [alt]="product.title" class="main-image" />
          </div>
          <div class="thumbs-row" *ngIf="product.imageUrls && product.imageUrls.length > 1">
            <button *ngFor="let img of product.imageUrls" type="button" (click)="activeImage = img" [class.selected]="activeImage === img" class="thumb-btn">
              <img appImgFallback [src]="img" [alt]="product.title" class="thumb-img" />
            </button>
          </div>
        </div>

        <!-- Información y pedido -->
        <div class="specs">
          <div class="badge-row">
            <span class="badge badge-gold" *ngIf="product.isUniquePiece">Pieza única hecha a mano</span>
            <span class="badge badge-neutral">{{ product.category?.name || 'Artesanía' }}</span>
          </div>

          <h1 class="prod-title">{{ product.title }}</h1>
          <p class="sku-code">SKU {{ product.sku }}</p>

          <div class="price-box">
            <span class="price-val">Bs. {{ product.price | number:'1.2-2' }}</span>
            <span class="stock-tag" [class.in-stock]="product.stock > 0">
              {{ product.stock > 0 ? product.stock + (product.stock > 1 ? ' unidades disponibles' : ' unidad disponible') : 'Agotado' }}
            </span>
          </div>

          <p class="description">{{ product.description }}</p>

          <aside class="artisan-card" *ngIf="product.artisan || product.workshop">
            <span class="eyebrow">Origen</span>
            <h4>{{ product.workshop?.name }}</h4>
            <p class="artisan-alias" *ngIf="product.artisan">
              Elaborado por <strong>{{ product.artisan.aliasCode }}</strong>
            </p>
            <blockquote class="impact-bio" *ngIf="product.artisan?.bioImpactStory">
              “{{ product.artisan.bioImpactStory }}”
            </blockquote>
          </aside>

          <div class="action-box">
            <button (click)="openOrderModal()" [disabled]="product.stock <= 0" class="btn btn-primary btn-lg">
              {{ product.stock > 0 ? 'Solicitar pedido' : 'Sin stock' }}
            </button>
            <a *ngIf="primaryBatch" [routerLink]="['/trazabilidad', primaryBatch.trackingCode]" class="btn btn-secondary btn-lg">
              Ver certificado de origen
            </a>
          </div>
        </div>
      </div>

      <!-- Trazabilidad -->
      <section class="trace-section" *ngIf="primaryBatch">
        <div class="trace-header">
          <div>
            <span class="eyebrow">Trazabilidad</span>
            <h2>Cómo se hizo esta pieza</h2>
          </div>
          <span class="lot-code">Lote {{ primaryBatch.trackingCode }}</span>
        </div>

        <div class="timeline" *ngIf="primaryBatch.events && primaryBatch.events.length > 0; else noEvents">
          <div *ngFor="let ev of primaryBatch.events" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="event-meta">
                <span class="badge badge-gold">{{ ev.stage | stageLabel }}</span>
                <span class="event-time">{{ ev.timestamp | date:'mediumDate' }}</span>
              </div>
              <h4>{{ ev.title }}</h4>
              <p>{{ ev.description }}</p>
              <span class="event-logged" *ngIf="ev.loggedBy">Registrado por {{ ev.loggedBy }}</span>
            </div>
          </div>
        </div>

        <ng-template #noEvents>
          <p class="text-muted py-3">Este lote aún no tiene etapas registradas.</p>
        </ng-template>
      </section>

      <!-- Modal de pedido -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeOrderModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Solicitar pedido</h2>
          <p class="text-muted">Déjanos tus datos y te contactaremos para coordinar el pago y la entrega de <strong>{{ product.title }}</strong>.</p>

          <form (ngSubmit)="submitOrder()" class="mt-4">
            <div class="form-group">
              <label class="form-label">Nombre completo *</label>
              <input type="text" class="form-control" [(ngModel)]="orderForm.customerName" name="customerName" required placeholder="Ej. Juan Pérez" />
            </div>

            <div class="grid-2 form-row">
              <div class="form-group">
                <label class="form-label">Correo electrónico *</label>
                <input type="email" class="form-control" [(ngModel)]="orderForm.customerEmail" name="customerEmail" required placeholder="juan&#64;correo.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono / WhatsApp *</label>
                <input type="text" class="form-control" [(ngModel)]="orderForm.customerPhone" name="customerPhone" required placeholder="71234567" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Dirección de entrega o notas</label>
              <textarea class="form-control" [(ngModel)]="orderForm.customerAddress" name="customerAddress" rows="2" placeholder="Ciudad, dirección o punto de referencia"></textarea>
            </div>

            <div class="form-group qty-group">
              <label class="form-label">Cantidad</label>
              <input type="number" class="form-control" [(ngModel)]="orderForm.quantity" name="quantity" min="1" [max]="product.stock" />
            </div>

            <div class="order-summary-box">
              <div class="summary-row">
                <span>Precio unitario</span>
                <span>Bs. {{ product.price | number:'1.2-2' }}</span>
              </div>
              <div class="summary-row total-row">
                <span>Total estimado</span>
                <span>Bs. {{ (product.price * orderForm.quantity) | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="modal-actions mt-4">
              <button type="button" (click)="closeOrderModal()" class="btn btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="submittingOrder" class="btn btn-primary">
                {{ submittingOrder ? 'Enviando…' : 'Confirmar solicitud' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-page { padding-top: 2rem; }
    .breadcrumb {
      display: flex;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }
    .detail-main {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 3.5rem;
      align-items: start;
    }
    .main-image-wrap {
      position: relative;
      aspect-ratio: 1 / 1;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg-sunken);
    }
    .main-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .thumbs-row { display: flex; gap: 0.6rem; margin-top: 0.75rem; }
    .thumb-btn {
      padding: 0;
      border: 2px solid transparent;
      border-radius: var(--radius-sm);
      overflow: hidden;
      cursor: pointer;
      background: none;
    }
    .thumb-btn.selected { border-color: var(--accent); }
    .thumb-img { width: 72px; height: 72px; object-fit: cover; }

    .badge-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
    .prod-title { font-size: clamp(2rem, 2vw + 1.2rem, 2.7rem); line-height: 1.1; }
    .sku-code { font-size: 0.8rem; color: var(--text-muted); margin: 0.4rem 0 1.4rem; letter-spacing: 0.04em; }
    .price-box {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
      padding: 1rem 0;
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 1.4rem;
    }
    .price-val { font-family: var(--font-heading); font-size: 2rem; font-weight: 600; }
    .description { color: var(--text-secondary); font-size: 1.02rem; margin-bottom: 1.5rem; }

    .artisan-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--aguayo-mustard);
      border-radius: var(--radius-md);
      padding: 1.1rem 1.25rem;
      margin-bottom: 1.75rem;
    }
    .artisan-card h4 { font-size: 1.15rem; margin: 0.2rem 0 0.25rem; }
    .artisan-alias { font-size: 0.9rem; color: var(--text-secondary); }
    .impact-bio {
      font-family: var(--font-heading);
      font-style: italic;
      font-size: 1rem;
      color: var(--text-secondary);
      margin-top: 0.6rem;
    }

    .action-box { display: flex; flex-wrap: wrap; gap: 0.75rem; }

    .trace-section {
      margin-top: 4.5rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      max-width: 820px;
    }
    .trace-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .trace-header h2 { font-size: 1.9rem; margin-top: 0.3rem; }
    .lot-code {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-dark);
      background: var(--accent-soft);
      padding: 0.35rem 0.8rem;
      border-radius: var(--radius-full);
    }

    .form-row { gap: 0 1rem; }
    .qty-group { max-width: 160px; }
    .order-summary-box {
      background: var(--bg-sunken);
      border-radius: var(--radius-md);
      padding: 1rem 1.1rem;
      margin-top: 0.5rem;
    }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.92rem; color: var(--text-secondary); }
    .total-row {
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      border-top: 1px solid var(--border-strong);
      padding-top: 0.6rem;
      margin-top: 0.6rem;
    }

    @media (max-width: 900px) {
      .detail-main { grid-template-columns: 1fr; gap: 2rem; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  primaryBatch: InventoryBatch | null = null;
  activeImage = '';
  showModal = false;
  submittingOrder = false;

  orderForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    quantity: 1,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.apiService.getProduct(productId).subscribe((p) => {
        this.product = p;
        if (p.imageUrls?.length > 0) this.activeImage = p.imageUrls[0];
        if (p.batches?.length > 0) this.primaryBatch = p.batches[0];
      });
    }
  }

  openOrderModal(): void {
    this.showModal = true;
  }

  closeOrderModal(): void {
    this.showModal = false;
  }

  submitOrder(): void {
    if (!this.product) return;
    this.submittingOrder = true;

    const payload = {
      customerName: this.orderForm.customerName,
      customerEmail: this.orderForm.customerEmail,
      customerPhone: this.orderForm.customerPhone,
      customerAddress: this.orderForm.customerAddress,
      items: [
        {
          productId: this.product.id,
          quantity: this.orderForm.quantity,
        },
      ],
    };

    this.apiService.createOrder(payload).subscribe({
      next: (order) => {
        this.submittingOrder = false;
        this.closeOrderModal();
        this.router.navigate(['/pedidos/rastreo'], { queryParams: { orderNumber: order.orderNumber } });
      },
      error: (err) => {
        this.submittingOrder = false;
        alert('Error al crear la solicitud de pedido');
      },
    });
  }
}
