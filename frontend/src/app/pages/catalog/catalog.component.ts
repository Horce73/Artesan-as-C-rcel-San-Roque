import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Product, Category, Workshop } from '../../models/san-roque.models';
import { ImgFallbackDirective } from '../../shared/img-fallback.directive';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ImgFallbackDirective],
  template: `
    <div class="container catalog-page">
      <div class="page-header">
        <span class="eyebrow">Catálogo</span>
        <h1>Artesanías de <span class="accent-text">San Roque</span></h1>
        <p>Piezas producidas en los talleres de formación del Centro Penitenciario San Roque.</p>
      </div>

      <!-- Filtros -->
      <div class="filter-bar">
        <div class="filter-search">
          <label class="form-label" for="f-search">Buscar</label>
          <input id="f-search" type="search" class="form-control" [(ngModel)]="searchQuery" (input)="onFilterChange()" placeholder="Cofre, poncho, billetera…" />
        </div>

        <div>
          <label class="form-label" for="f-cat">Categoría</label>
          <select id="f-cat" class="form-control" [(ngModel)]="selectedCategoryId" (change)="onFilterChange()">
            <option value="">Todas</option>
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>

        <div>
          <label class="form-label" for="f-ws">Taller</label>
          <select id="f-ws" class="form-control" [(ngModel)]="selectedWorkshopId" (change)="onFilterChange()">
            <option value="">Todos</option>
            <option *ngFor="let w of workshops" [value]="w.id">{{ w.name }}</option>
          </select>
        </div>

        <button (click)="resetFilters()" class="btn btn-secondary" [disabled]="!searchQuery && !selectedCategoryId && !selectedWorkshopId">Limpiar</button>
      </div>

      <p class="result-count" *ngIf="!loading">
        {{ products.length }} {{ products.length === 1 ? 'pieza' : 'piezas' }}
      </p>

      <!-- Resultados -->
      <div *ngIf="loading" class="grid-3">
        <div *ngFor="let s of [1,2,3]" class="skeleton"></div>
      </div>

      <div *ngIf="!loading && products.length === 0" class="empty-box">
        <h3>No encontramos piezas</h3>
        <p>Prueba con otra búsqueda o quita algunos filtros.</p>
        <button (click)="resetFilters()" class="btn btn-primary mt-3">Ver todas las piezas</button>
      </div>

      <div *ngIf="!loading && products.length > 0" class="grid-3">
        <a *ngFor="let prod of products" [routerLink]="['/producto', prod.id]" class="craft-card">
          <div class="craft-img-wrap">
            <img appImgFallback [src]="prod.imageUrls?.[0] || ''" [alt]="prod.title" class="craft-img" />
            <span class="badge craft-badge" *ngIf="prod.isUniquePiece">Pieza única</span>
          </div>
          <div class="craft-body">
            <span class="craft-workshop">{{ prod.workshop?.name || 'San Roque' }}</span>
            <h3 class="craft-title">{{ prod.title }}</h3>
            <p class="craft-desc">{{ prod.description }}</p>
            <div class="craft-footer">
              <span class="craft-price">Bs. {{ prod.price | number:'1.0-0' }}</span>
              <span class="stock-tag" [class.in-stock]="prod.stock > 0">
                {{ prod.stock > 0 ? prod.stock + ' disponible' + (prod.stock > 1 ? 's' : '') : 'Agotado' }}
              </span>
            </div>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: grid;
      grid-template-columns: 2fr 1.2fr 1.2fr auto;
      gap: 1rem;
      align-items: end;
      padding: 1.1rem 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }
    .result-count {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 1.25rem 0 1rem;
    }
    .skeleton {
      height: 380px;
      border-radius: var(--radius-md);
      background: linear-gradient(90deg, var(--bg-sunken) 0%, #F7F2EA 50%, var(--bg-sunken) 100%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite linear;
    }
    @keyframes shimmer {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }
    @media (max-width: 900px) {
      .filter-bar { grid-template-columns: 1fr 1fr; }
      .filter-search { grid-column: 1 / -1; }
    }
  `]
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  workshops: Workshop[] = [];
  loading = true;

  searchQuery = '';
  selectedCategoryId = '';
  selectedWorkshopId = '';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.apiService.getCategories().subscribe((cats) => (this.categories = cats));
    this.apiService.getWorkshops().subscribe((ws) => (this.workshops = ws));

    this.route.queryParams.subscribe((params) => {
      if (params['categoryId']) {
        this.selectedCategoryId = params['categoryId'];
      }
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;
    this.apiService
      .getProducts({
        categoryId: this.selectedCategoryId,
        workshopId: this.selectedWorkshopId,
        search: this.searchQuery,
      })
      .subscribe((prods) => {
        this.products = prods;
        this.loading = false;
      });
  }

  onFilterChange(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryId = '';
    this.selectedWorkshopId = '';
    this.loadProducts();
  }
}
