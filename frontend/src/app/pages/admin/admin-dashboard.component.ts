import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product, Category, Workshop, Artisan, InventoryBatch, Order } from '../../models/san-roque.models';
import { ImgFallbackDirective } from '../../shared/img-fallback.directive';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ImgFallbackDirective],
  template: `
    <div class="container admin-dashboard">
      <div class="admin-header">
        <div>
          <span class="eyebrow">Administración</span>
          <h1>Panel de gestión</h1>
          <p class="text-muted">Inventario, catálogo, trazabilidad y solicitudes de pedido.</p>
        </div>
      </div>

      <!-- KPIs -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-val">{{ products.length }}</div>
          <div class="kpi-lbl">Productos en catálogo</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">{{ orders.length }}</div>
          <div class="kpi-lbl">Solicitudes de pedido</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">{{ batches.length }}</div>
          <div class="kpi-lbl">Lotes con trazabilidad</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">{{ workshops.length }}</div>
          <div class="kpi-lbl">Talleres activos</div>
        </div>
      </div>

      <div class="tabs" role="tablist">
        <button role="tab" (click)="activeTab = 'products'" [class.active]="activeTab === 'products'">Productos</button>
        <button role="tab" (click)="activeTab = 'orders'" [class.active]="activeTab === 'orders'">Pedidos</button>
        <button role="tab" (click)="activeTab = 'traceability'" [class.active]="activeTab === 'traceability'">Trazabilidad</button>
        <button role="tab" (click)="activeTab = 'workshops'" [class.active]="activeTab === 'workshops'">Talleres</button>
      </div>

      <!-- TAB 1: PRODUCTOS -->
      <section *ngIf="activeTab === 'products'" class="tab-content">
        <div class="content-header">
          <h3>Productos e inventario</h3>
          <button (click)="openProductModal()" class="btn btn-primary btn-sm">+ Nuevo producto</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría / Taller</th>
                <th class="num">Precio</th>
                <th class="num">Stock</th>
                <th class="actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prod of products">
                <td>
                  <div class="prod-cell">
                    <img appImgFallback [src]="prod.imageUrls?.[0] || ''" [alt]="prod.title" class="table-thumb" />
                    <div>
                      <strong>{{ prod.title }}</strong>
                      <small class="text-muted">{{ prod.sku }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  {{ prod.category?.name }}
                  <small class="text-muted">{{ prod.workshop?.name }}</small>
                </td>
                <td class="num">Bs. {{ prod.price | number:'1.2-2' }}</td>
                <td class="num">
                  <span class="badge" [class.badge-success]="prod.stock > 0" [class.badge-danger]="prod.stock <= 0">
                    {{ prod.stock }}
                  </span>
                </td>
                <td class="actions">
                  <button (click)="openProductModal(prod)" class="btn btn-secondary btn-sm me-2">Editar</button>
                  <button (click)="deleteProduct(prod.id)" class="btn btn-danger btn-sm">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 2: PEDIDOS -->
      <section *ngIf="activeTab === 'orders'" class="tab-content">
        <div class="content-header">
          <h3>Solicitudes de pedido</h3>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>N° pedido</th>
                <th>Cliente</th>
                <th>Contacto</th>
                <th class="num">Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="orders.length === 0">
                <td colspan="5" class="empty-row">Todavía no hay solicitudes de pedido.</td>
              </tr>
              <tr *ngFor="let ord of orders">
                <td><strong>{{ ord.orderNumber }}</strong></td>
                <td>{{ ord.customerName }}</td>
                <td>
                  {{ ord.customerPhone }}
                  <small class="text-muted">{{ ord.customerEmail }}</small>
                </td>
                <td class="num"><strong>Bs. {{ ord.totalAmount | number:'1.2-2' }}</strong></td>
                <td>
                  <select class="form-control form-control-sm status-select" [attr.data-status]="ord.status" [ngModel]="ord.status" (change)="changeOrderStatus(ord.id, $event)">
                    <option value="PENDING">Pendiente</option>
                    <option value="IN_PROCESS">En proceso</option>
                    <option value="READY_FOR_PICKUP">Listo para entrega</option>
                    <option value="COMPLETED">Completado</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 3: TRAZABILIDAD -->
      <section *ngIf="activeTab === 'traceability'" class="tab-content">
        <div class="content-header">
          <h3>Lotes y etapas de fabricación</h3>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Taller</th>
                <th class="num">Etapas</th>
                <th class="actions">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let b of batches">
                <td><code>{{ b.trackingCode }}</code></td>
                <td>{{ b.product?.title }}</td>
                <td>{{ b.product?.workshop?.name }}</td>
                <td class="num">{{ b.events?.length || 0 }}</td>
                <td class="actions">
                  <button (click)="openEventModal(b)" class="btn btn-secondary btn-sm">+ Registrar etapa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 4: TALLERES -->
      <section *ngIf="activeTab === 'workshops'" class="tab-content">
        <div class="content-header">
          <h3>Talleres de capacitación</h3>
        </div>

        <div class="grid-2">
          <div *ngFor="let w of workshops" class="workshop-card">
            <span class="badge badge-neutral">{{ w.code }}</span>
            <h4>{{ w.name }}</h4>
            <p class="text-muted">{{ w.description }}</p>
            <div class="artisans">
              <span class="form-label">Artesanos asignados</span>
              <ul class="artisan-list">
                <li *ngFor="let a of w.artisans">{{ a.aliasCode }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- PRODUCT MODAL -->
      <div class="modal-overlay" *ngIf="showProductModal">
        <div class="modal-content">
          <h3>{{ editingProductId ? 'Editar producto' : 'Nuevo producto' }}</h3>
          <form (ngSubmit)="saveProduct()" class="mt-3">
            <div class="form-group">
              <label class="form-label">Título del Producto *</label>
              <input type="text" class="form-control" [(ngModel)]="prodForm.title" name="title" required />
            </div>

            <div class="grid-2 form-row">
              <div class="form-group">
                <label class="form-label">Categoría *</label>
                <select class="form-control" [(ngModel)]="prodForm.categoryId" name="categoryId" required>
                  <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Taller Artesanal *</label>
                <select class="form-control" [(ngModel)]="prodForm.workshopId" name="workshopId" required>
                  <option *ngFor="let w of workshops" [value]="w.id">{{ w.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid-3 form-row">
              <div class="form-group">
                <label class="form-label">Precio (Bs) *</label>
                <input type="number" class="form-control" [(ngModel)]="prodForm.price" name="price" required />
              </div>
              <div class="form-group">
                <label class="form-label">Stock *</label>
                <input type="number" class="form-control" [(ngModel)]="prodForm.stock" name="stock" required />
              </div>
              <div class="form-group">
                <label class="form-label">SKU *</label>
                <input type="text" class="form-control" [(ngModel)]="prodForm.sku" name="sku" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Imagen del Producto (Archivo local)</label>
              <input type="file" (change)="onFileSelected($event)" class="form-control" accept="image/*" />
              <small class="text-muted" *ngIf="uploadedImageUrl">Imagen subida: {{ uploadedImageUrl }}</small>
            </div>

            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea class="form-control" [(ngModel)]="prodForm.description" name="description" rows="3"></textarea>
            </div>

            <div class="modal-actions mt-4">
              <button type="button" (click)="closeProductModal()" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar producto</button>
            </div>
          </form>
        </div>
      </div>

      <!-- TRACEABILITY EVENT MODAL -->
      <div class="modal-overlay" *ngIf="showEventModal && selectedBatch">
        <div class="modal-content">
          <h3>Registrar etapa</h3>
          <p class="text-muted">Lote {{ selectedBatch.trackingCode }}</p>
          <form (ngSubmit)="saveTraceabilityEvent()" class="mt-3">
            <div class="form-group">
              <label class="form-label">Etapa de Elaboración *</label>
              <select class="form-control" [(ngModel)]="eventForm.stage" name="stage" required>
                <option value="MATERIA_PRIMA">MATERIA_PRIMA (Materia Prima)</option>
                <option value="DISENO_CORTE">DISENO_CORTE (Diseño y Corte)</option>
                <option value="ENSAMBLE_TALLADO">ENSAMBLE_TALLADO (Ensamble / Tallado)</option>
                <option value="ACABADO_BARNIZ">ACABADO_BARNIZ (Acabado y Barniz)</option>
                <option value="CONTROL_CALIDAD">CONTROL_CALIDAD (Control de Calidad)</option>
                <option value="LISTO_CATALOGO">LISTO_CATALOGO (Listo en Catálogo)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Título del Hito *</label>
              <input type="text" class="form-control" [(ngModel)]="eventForm.title" name="title" required placeholder="Ej. Tallado barroco a mano" />
            </div>

            <div class="form-group">
              <label class="form-label">Descripción Detallada *</label>
              <textarea class="form-control" [(ngModel)]="eventForm.description" name="description" rows="3" required></textarea>
            </div>

            <div class="modal-actions mt-4">
              <button type="button" (click)="closeEventModal()" class="btn btn-secondary">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar etapa</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard { padding-top: 2.5rem; }
    .admin-header h1 { font-size: 2.3rem; margin: 0.3rem 0 0.2rem; }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }
    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.1rem 1.25rem;
    }
    .kpi-val {
      font-family: var(--font-heading);
      font-size: 2.2rem;
      font-weight: 500;
      line-height: 1.1;
      color: var(--accent);
    }
    .kpi-lbl { font-size: 0.84rem; color: var(--text-secondary); margin-top: 0.2rem; }

    .tabs {
      display: flex;
      gap: 0.25rem;
      border-bottom: 1px solid var(--border-color);
      overflow-x: auto;
    }
    .tabs button {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      padding: 0.75rem 1rem;
      margin-bottom: -1px;
      font-family: var(--font-body);
      font-size: 0.93rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      white-space: nowrap;
    }
    .tabs button:hover { color: var(--text-primary); }
    .tabs button.active {
      color: var(--accent-dark);
      border-bottom-color: var(--accent);
      font-weight: 600;
    }

    .tab-content {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      padding: 1.5rem;
    }
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .content-header h3 { font-size: 1.35rem; }

    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
    .data-table th, .data-table td {
      padding: 0.8rem 0.9rem;
      border-bottom: 1px solid var(--border-color);
      text-align: left;
      vertical-align: middle;
    }
    .data-table tbody tr:hover { background: #FBF7F1; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table th {
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
      background: var(--bg-main);
    }
    .data-table small { display: block; font-size: 0.8rem; }
    .data-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .data-table .actions { text-align: right; white-space: nowrap; }
    .data-table code {
      font-family: ui-monospace, 'SF Mono', Menlo, monospace;
      font-size: 0.85rem;
      color: var(--accent-dark);
    }
    .empty-row { text-align: center !important; color: var(--text-muted); padding: 2rem !important; }
    .prod-cell { display: flex; align-items: center; gap: 0.8rem; }
    .table-thumb {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      background: var(--bg-sunken);
      flex: none;
    }
    .status-select { width: auto; min-width: 170px; font-weight: 600; }
    .status-select[data-status="PENDING"] { background: var(--warning-soft); color: var(--warning); border-color: transparent; }
    .status-select[data-status="IN_PROCESS"],
    .status-select[data-status="READY_FOR_PICKUP"] { background: var(--info-soft); color: var(--info); border-color: transparent; }
    .status-select[data-status="COMPLETED"] { background: var(--success-soft); color: var(--success); border-color: transparent; }
    .status-select[data-status="CANCELLED"] { background: var(--danger-soft); color: var(--danger); border-color: transparent; }

    .workshop-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
    }
    .workshop-card h4 { font-size: 1.2rem; margin: 0.6rem 0 0.3rem; }
    .workshop-card p { font-size: 0.9rem; }
    .artisans { margin-top: 1rem; }
    .artisan-list { list-style: none; display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .artisan-list li {
      font-size: 0.82rem;
      background: var(--bg-sunken);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-full);
    }
    .form-row { gap: 0 1rem; }

    @media (max-width: 900px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'products';
  products: Product[] = [];
  orders: Order[] = [];
  batches: InventoryBatch[] = [];
  categories: Category[] = [];
  workshops: Workshop[] = [];

  showProductModal = false;
  editingProductId = '';
  uploadedImageUrl = '';

  prodForm = {
    title: '',
    categoryId: '',
    workshopId: '',
    price: 100,
    stock: 1,
    sku: '',
    description: '',
  };

  showEventModal = false;
  selectedBatch: InventoryBatch | null = null;
  eventForm = {
    stage: 'ENSAMBLE_TALLADO',
    title: '',
    description: '',
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.apiService.getProducts().subscribe((p) => (this.products = p));
    this.apiService.getCategories().subscribe((c) => (this.categories = c));
    this.apiService.getWorkshops().subscribe((w) => (this.workshops = w));
    this.apiService.getAdminOrders().subscribe((o) => (this.orders = o));
    this.apiService.getAllBatches().subscribe((b) => (this.batches = b));
  }

  // Product CRUD
  openProductModal(prod?: Product): void {
    if (prod) {
      this.editingProductId = prod.id;
      this.prodForm = {
        title: prod.title,
        categoryId: prod.categoryId,
        workshopId: prod.workshopId,
        price: prod.price,
        stock: prod.stock,
        sku: prod.sku,
        description: prod.description,
      };
      this.uploadedImageUrl = prod.imageUrls?.[0] || '';
    } else {
      this.editingProductId = '';
      this.prodForm = {
        title: '',
        categoryId: this.categories[0]?.id || '',
        workshopId: this.workshops[0]?.id || '',
        price: 100,
        stock: 1,
        sku: `SR-PROD-${Math.floor(100 + Math.random() * 900)}`,
        description: '',
      };
      this.uploadedImageUrl = '';
    }
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.apiService.uploadImage(file).subscribe({
        next: (res) => {
          this.uploadedImageUrl = res.url;
        },
        error: () => alert('Error al subir la imagen'),
      });
    }
  }

  saveProduct(): void {
    const payload = {
      ...this.prodForm,
      imageUrls: this.uploadedImageUrl ? [this.uploadedImageUrl] : ['https://images.unsplash.com/photo-1546484475-7f7bd55792da?auto=format&fit=crop&w=800&q=80'],
    };

    if (this.editingProductId) {
      this.apiService.updateProduct(this.editingProductId, payload).subscribe(() => {
        this.closeProductModal();
        this.loadAll();
      });
    } else {
      this.apiService.createProduct(payload).subscribe(() => {
        this.closeProductModal();
        this.loadAll();
      });
    }
  }

  deleteProduct(id: string): void {
    if (confirm('¿Desea eliminar este producto del catálogo?')) {
      this.apiService.deleteProduct(id).subscribe(() => this.loadAll());
    }
  }

  // Orders
  changeOrderStatus(orderId: string, event: any): void {
    const newStatus = event.target.value;
    this.apiService.updateOrderStatus(orderId, newStatus).subscribe(() => this.loadAll());
  }

  // Traceability Event Logging
  openEventModal(batch: InventoryBatch): void {
    this.selectedBatch = batch;
    this.eventForm = { stage: 'ENSAMBLE_TALLADO', title: '', description: '' };
    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedBatch = null;
  }

  saveTraceabilityEvent(): void {
    if (!this.selectedBatch) return;
    this.apiService.addTraceabilityEvent(this.selectedBatch.id, this.eventForm).subscribe(() => {
      this.closeEventModal();
      this.loadAll();
    });
  }
}
