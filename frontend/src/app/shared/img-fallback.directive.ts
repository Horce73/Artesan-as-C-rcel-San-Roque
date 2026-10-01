import { Directive, HostBinding, HostListener } from '@angular/core';

// Placeholder mostrado cuando la foto del producto falta o no carga.
const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#EFE8DC"/>
  <g transform="translate(0 132)">
    <rect width="400" height="9" fill="#7A2E3A"/>
    <rect y="9" width="400" height="9" fill="#B4532A"/>
    <rect y="18" width="400" height="9" fill="#D9A441"/>
    <rect y="27" width="400" height="9" fill="#2F5D50"/>
  </g>
  <text x="200" y="208" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="18" fill="#8A7B6C">Fotografía pendiente</text>
</svg>`);

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective {
  @HostBinding('attr.loading') loading = 'lazy';

  @HostListener('error', ['$event.target'])
  onError(img: HTMLImageElement): void {
    if (img.src !== PLACEHOLDER) {
      img.src = PLACEHOLDER;
    }
  }
}
