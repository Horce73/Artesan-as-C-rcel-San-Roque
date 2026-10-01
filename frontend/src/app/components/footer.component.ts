import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="aguayo"></div>
      <div class="container footer-container">
        <div class="footer-brand">
          <h3>Artesanías San Roque</h3>
          <p>Programa de reinserción social y desarrollo emprendedor a través de la carpintería, la talabartería, el telar tradicional y el arte virreinal.</p>
        </div>
        <div class="footer-col">
          <h4>Visítanos</h4>
          <p>Centro Penitenciario San Roque<br>Calle Bolívar N° 1019, Sucre, Bolivia</p>
        </div>
        <div class="footer-col">
          <h4>Compra con confianza</h4>
          <p>Cada pieza lleva un código de trazabilidad que certifica su origen y proceso de elaboración.</p>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>© 2026 Artesanías San Roque · Impulsando segundas oportunidades.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--text-primary);
      color: #D9CFC2;
      margin-top: 5rem;
    }
    .footer-container {
      display: grid;
      grid-template-columns: 1.6fr 1fr 1fr;
      gap: 3rem;
      padding-top: 3rem;
      padding-bottom: 2.5rem;
    }
    .footer-brand h3 {
      font-size: 1.5rem;
      color: #FFF;
      margin-bottom: 0.6rem;
    }
    .footer-brand p, .footer-col p {
      font-size: 0.9rem;
      max-width: 440px;
      color: #BFB2A3;
    }
    .footer-col h4 {
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--aguayo-mustard);
      margin-bottom: 0.6rem;
    }
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.1rem 0;
      font-size: 0.8rem;
      color: #9C8F80;
    }
    @media (max-width: 768px) {
      .footer-container { grid-template-columns: 1fr; gap: 1.75rem; }
    }
  `]
})
export class FooterComponent {}
