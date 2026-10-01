import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { InventoryBatch } from './inventory-batch.entity';

export enum TraceabilityStage {
  MATERIA_PRIMA = 'MATERIA_PRIMA',
  DISENO_CORTE = 'DISENO_CORTE',
  ENSAMBLE_TALLADO = 'ENSAMBLE_TALLADO',
  ACABADO_BARNIZ = 'ACABADO_BARNIZ',
  CONTROL_CALIDAD = 'CONTROL_CALIDAD',
  LISTO_CATALOGO = 'LISTO_CATALOGO',
}

@Entity('traceability_events')
export class TraceabilityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  batchId: string;

  @ManyToOne(() => InventoryBatch, (b) => b.events, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  batch: InventoryBatch;

  @Column({ type: 'varchar', default: TraceabilityStage.MATERIA_PRIMA })
  stage: TraceabilityStage;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  loggedBy: string;

  @CreateDateColumn()
  timestamp: Date;
}
