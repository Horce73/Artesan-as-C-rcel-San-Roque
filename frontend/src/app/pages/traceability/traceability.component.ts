import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { StageLabelPipe } from '../../shared/stage-label.pipe';
import { InventoryBatch } from '../../models/san-roque.models';

@Component({
  selector: 'app-traceability',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StageLabelPipe],
  template: `
    <div class="container trace-page">
      <div class="page-header centered">
        <span class="eyebrow">Verificador de origen</span>
        <h1>Conoce la historia <span class="accent-text">de tu pieza</span></h1>
        <p>Ingresa el código de trazabilidad impreso en la etiqueta o escanea su código QR.</p>
      </div>

      <form (ngSubmit)="searchCode()" class="search-form">
        <input type="text" class="form-control form-control-lg" [(ngModel)]="searchTrackingCode" name="code" placeholder="Ej. SR-CARP-2026-001" required aria-label="Código de trazabilidad" />
        <button type="submit" class="btn btn-primary btn-lg">Verificar</button>
      </form>

      <div *ngIf="searched && !batch" class="empty-box result">
        <h3>Código no encontrado</h3>
        <p>Revisa que el código coincida con el de la etiqueta de tu producto.</p>
      </div>

      <article *ngIf="batch" class="certificate result">
        <div class="aguayo"></div>
        <div class="cert-inner">
          <header class="cert-header">
            <div>
              <span class="eyebrow">Certificado digital de origen</span>
              <h2>{{ batch.product?.title }}</h2>
              <p class="cert-place">Centro Penitenciario San Roque · Sucre, Bolivia</p>
            </div>
            <div class="seal">
              <span class="seal-label">Código</span>
              <strong>{{ batch.trackingCode }}</strong>
              <span class="badge badge-success">{{ batch.batchStatus | stageLabel }}</span>
            </div>
          </header>

          <div class="cert-body">
            <div>
              <h4>La pieza</h4>
              <dl>
                <dt>Categoría</dt><dd>{{ batch.product?.category?.name }}</dd>
                <dt>SKU</dt><dd>{{ batch.product?.sku }}</dd>
              </dl>
            </div>
            <div>
              <h4>Taller y artesano</h4>
              <dl>
                <dt>Taller</dt><dd>{{ batch.product?.workshop?.name }}</dd>
                <dt>Artesano</dt><dd>{{ batch.product?.artisan?.aliasCode || 'Taller colectivo' }}</dd>
              </dl>
              <blockquote class="bio-quote" *ngIf="batch.product?.artisan?.bioImpactStory">
                “{{ batch.product?.artisan?.bioImpactStory }}”
              </blockquote>
            </div>
          </div>

          <section class="cert-timeline">
            <h4>Proceso de elaboración</h4>
            <div class="timeline" *ngIf="batch.events && batch.events.length > 0; else noEvs">
              <div *ngFor="let ev of batch.events" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <div class="event-meta">
                    <span class="badge badge-gold">{{ ev.stage | stageLabel }}</span>
                    <span class="event-time">{{ ev.timestamp | date:'medium' }}</span>
                  </div>
                  <h5>{{ ev.title }}</h5>
                  <p>{{ ev.description }}</p>
                  <span class="event-logged">Registrado por {{ ev.loggedBy }}</span>
                </div>
              </div>
            </div>
            <ng-template #noEvs>
              <p class="text-muted mt-2">Aún no hay etapas registradas para este lote.</p>
            </ng-template>
          </section>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .search-form {
      display: flex;
      gap: 0.75rem;
      max-width: 640px;
      margin: 0 auto;
    }
    .result {
      max-width: 880px;
      margin: 2.5rem auto 0;
    }
    .certificate {
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-md);
    }
    .cert-inner { padding: 2.25rem 2.5rem 2.5rem; }
    .cert-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;
      padding-bottom: 1.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    .cert-header h2 { font-size: 2rem; margin: 0.35rem 0 0.25rem; }
    .cert-place { color: var(--text-muted); font-size: 0.9rem; }
    .seal {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      padding: 1rem 1.25rem;
      border: 2px dashed var(--accent);
      border-radius: var(--radius-md);
      text-align: center;
    }
    .seal-label {
      font-size: 0.68rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .seal strong {
      font-family: ui-monospace, 'SF Mono', Menlo, monospace;
      font-size: 0.95rem;
      color: var(--accent-dark);
    }

    .cert-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 1.75rem 0;
      border-bottom: 1px solid var(--border-color);
    }
    .cert-body h4, .cert-timeline h4 {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.4rem 1rem;
      font-size: 0.95rem;
    }
    dt { color: var(--text-muted); }
    dd { font-weight: 500; }
    .bio-quote {
      font-family: var(--font-heading);
      font-style: italic;
      color: var(--text-secondary);
      margin-top: 0.9rem;
    }
    .cert-timeline { padding-top: 1.75rem; }

    @media (max-width: 700px) {
      .search-form { flex-direction: column; }
      .cert-inner { padding: 1.5rem; }
      .cert-header { flex-direction: column; gap: 1.25rem; }
      .cert-body { grid-template-columns: 1fr; }
    }
  `]
})
export class TraceabilityComponent implements OnInit {
  searchTrackingCode = '';
  batch: InventoryBatch | null = null;
  searched = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    const codeParam = this.route.snapshot.paramMap.get('code');
    if (codeParam) {
      this.searchTrackingCode = codeParam;
      this.searchCode();
    }
  }

  searchCode(): void {
    if (!this.searchTrackingCode) return;
    this.searched = true;
    this.apiService.getTraceabilityByCode(this.searchTrackingCode.trim()).subscribe({
      next: (b) => (this.batch = b),
      error: () => (this.batch = null),
    });
  }
}
