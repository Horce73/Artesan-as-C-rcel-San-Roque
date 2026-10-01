import { Pipe, PipeTransform } from '@angular/core';

const STAGE_LABELS: Record<string, string> = {
  MATERIA_PRIMA: 'Materia prima',
  DISENO_CORTE: 'Diseño y corte',
  ENSAMBLE_TALLADO: 'Ensamble / tallado',
  ACABADO_BARNIZ: 'Acabado y barniz',
  CONTROL_CALIDAD: 'Control de calidad',
  LISTO_CATALOGO: 'Listo en catálogo',
};

@Pipe({ name: 'stageLabel', standalone: true })
export class StageLabelPipe implements PipeTransform {
  transform(stage: string | null | undefined): string {
    return stage ? STAGE_LABELS[stage] || stage : '';
  }
}
