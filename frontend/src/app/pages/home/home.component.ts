import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product, Category, Workshop } from '../../models/san-roque.models';
import { ImgFallbackDirective } from '../../shared/img-fallback.directive';

// Pieza que se muestra en la portada; si no existe se usa la más reciente.
const HERO_SKU = 'SR-CARP-BAR-04';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ImgFallbackDirective],
  template: `
    <div class="home-page">
      <!-- Hero -->
      <section class="hero">
        <div class="container hero-container">
          <div class="hero-content">
            <span class="eyebrow">Reinserción social · Talento chuquisaqueño</span>
            <h1 class="hero-title">Piezas hechas a mano con <span class="accent-text">una segunda oportunidad</span></h1>
            <p class="hero-subtitle">
              Madera tallada, cuero repujado, textiles de telar y arte virreinal creados en los talleres del Centro Penitenciario San Roque. Cada compra sostiene a un artesano y a su familia.
            </p>

            <div class="hero-actions">
              <a routerLink="/catalogo" class="btn btn-primary btn-lg">Explorar el catálogo</a>
              <a routerLink="/trazabilidad" class="btn btn-secondary btn-lg">Verificar una pieza</a>
            </div>

            <dl class="stats">
              <div>
                <dt>{{ categories.length || 4 }}</dt>
                <dd>Oficios artesanales</dd>
              </div>
              <div>
                <dt>100%</dt>
                <dd>Impacto directo al artesano</dd>
              </div>
              <div>
                <dt>QR</dt>
                <dd>Certificado de origen en cada pieza</dd>
              </div>
            </dl>
          </div>

          <figure class="hero-figure" *ngIf="heroProduct as hero">
            <a [routerLink]="['/producto', hero.id]" class="hero-img-wrap">
              <img appImgFallback [src]="hero.imageUrls?.[0] || ''" [alt]="hero.title" class="hero-img" />
            </a>
            <figcaption class="hero-caption">
              <div>
                <span class="caption-label">Pieza destacada</span>
                <h4>{{ hero.title }}</h4>
                <p>{{ hero.workshop?.name || 'Talleres San Roque' }}</p>
              </div>
              <span class="caption-price">Bs. {{ hero.price | number:'1.0-0' }}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <!-- Categorías -->
      <section class="section container" *ngIf="categories.length > 0">
        <div class="section-header">
          <div>
            <span class="eyebrow">Oficios</span>
            <h2>Lo que se crea en San Roque</h2>
          </div>
          <a routerLink="/catalogo" class="btn-link">Ver todo el catálogo →</a>
        </div>

        <div class="grid-4 cat-grid">
          <a *ngFor="let cat of categories" [routerLink]="['/catalogo']" [queryParams]="{ categoryId: cat.id }" class="category-card">
            <div class="cat-img-wrap">
              <img appImgFallback [src]="cat.imageUrl || ''" [alt]="cat.name" class="cat-img" />
            </div>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.description }}</p>
          </a>
        </div>
      </section>

      <!-- Cómo funciona -->
      <section class="section container">
        <div class="how">
          <div class="how-intro">
            <span class="eyebrow">Cómo comprar</span>
            <h2>Una compra directa, sin intermediarios</h2>
          </div>
          <ol class="how-steps">
            <li>
              <span class="step-n">1</span>
              <h4>Elige tu pieza</h4>
              <p>Explora el catálogo por oficio o taller y revisa la historia de cada obra.</p>
            </li>
            <li>
              <span class="step-n">2</span>
              <h4>Solicita tu pedido</h4>
              <p>Deja tus datos y te contactamos por WhatsApp para coordinar el pago y la entrega.</p>
            </li>
            <li>
              <span class="step-n">3</span>
              <h4>Verifica su origen</h4>
              <p>Con el código de trazabilidad consultas cómo y dónde se elaboró tu pieza.</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- Obras destacadas -->
      <section class="section container" *ngIf="featuredProducts.length > 0">
        <div class="section-header">
          <div>
            <span class="eyebrow">Disponibles ahora</span>
            <h2>Obras destacadas</h2>
          </div>
          <a routerLink="/catalogo" class="btn-link">Ver catálogo completo →</a>
        </div>

        <div class="grid-3">
          <a *ngFor="let prod of featuredProducts" [routerLink]="['/producto', prod.id]" class="craft-card">
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
      </section>
    </div>
  `,
  styles: [`
    .hero {
      padding: 4rem 0 3rem;
    }
    .hero-container {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 4rem;
      align-items: center;
    }
    .hero-title {
      font-size: clamp(2.4rem, 4vw + 1rem, 3.8rem);
      line-height: 1.08;
      letter-spacing: -0.025em;
      margin: 1rem 0 1.25rem;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      max-width: 560px;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2.75rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-top: 1px solid var(--border-strong);
      padding-top: 1.25rem;
      max-width: 560px;
    }
    .stats div + div {
      border-left: 1px solid var(--border-color);
      padding-left: 1.25rem;
    }
    .stats dt {
      font-family: var(--font-heading);
      font-size: 1.9rem;
      font-weight: 500;
      color: var(--accent);
      line-height: 1.1;
    }
    .stats dd {
      font-size: 0.82rem;
      color: var(--text-secondary);
      margin-top: 0.2rem;
      padding-right: 0.5rem;
    }

    .hero-figure {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 0.75rem;
      box-shadow: var(--shadow-md);
      transform: rotate(1deg);
    }
    .hero-img-wrap {
      position: relative;
      display: block;
      aspect-ratio: 4 / 3.4;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-sunken);
    }
    .hero-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-caption {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      padding: 1rem 0.5rem 0.4rem;
    }
    .caption-label {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .hero-caption h4 {
      font-size: 1.2rem;
      margin: 0.15rem 0;
    }
    .hero-caption p {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .caption-price {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .section { margin-top: 5rem; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 1rem;
      margin-bottom: 1.75rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .section-header h2 {
      font-size: clamp(1.7rem, 2vw + 1rem, 2.3rem);
      margin-top: 0.3rem;
    }

    .category-card {
      color: inherit;
      display: flex;
      flex-direction: column;
    }
    .category-card:hover { color: inherit; }
    .cat-img-wrap {
      position: relative;
      aspect-ratio: 1 / 1;
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--bg-sunken);
      margin-bottom: 0.9rem;
    }
    .cat-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }
    .category-card:hover .cat-img { transform: scale(1.04); }
    .category-card h3 {
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }
    .category-card:hover h3 { color: var(--accent); }
    .category-card p {
      font-size: 0.88rem;
      color: var(--text-secondary);
    }

    .how {
      display: grid;
      grid-template-columns: 0.8fr 2fr;
      gap: 3rem;
      background: var(--bg-sunken);
      border-radius: var(--radius-lg);
      padding: 2.5rem;
    }
    .how-intro h2 {
      font-size: 1.8rem;
      margin-top: 0.4rem;
    }
    .how-steps {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .step-n {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--accent);
      color: var(--accent);
      font-family: var(--font-heading);
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    .how-steps h4 {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
    }
    .how-steps p {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    @media (max-width: 960px) {
      .hero-container, .how { grid-template-columns: 1fr; gap: 2.5rem; }
      .hero-figure { transform: none; }
      .how-steps { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .hero { padding-top: 2.5rem; }
      .section-header { flex-direction: column; align-items: flex-start; }
      .stats div + div { padding-left: 0.75rem; }
      .how { padding: 1.75rem; }
      .cat-grid { grid-template-columns: repeat(2, 1fr); gap: 1.25rem 1rem; }
      .category-card h3 { font-size: 1.05rem; }
      .category-card p { display: none; }
    }
  `]
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  heroProduct: Product | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getCategories().subscribe((cats) => (this.categories = cats));
    this.apiService.getProducts().subscribe((prods) => {
      this.heroProduct = prods.find((p) => p.sku === HERO_SKU) || prods[0] || null;
      this.featuredProducts = prods.filter((p) => p !== this.heroProduct).slice(0, 6);
    });
  }
}
