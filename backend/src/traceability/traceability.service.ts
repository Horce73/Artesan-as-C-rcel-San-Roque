import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { TraceabilityEvent, TraceabilityStage } from '../entities/traceability-event.entity';

@Injectable()
export class TraceabilityService {
  constructor(
    @InjectRepository(InventoryBatch)
    private batchRepository: Repository<InventoryBatch>,
    @InjectRepository(TraceabilityEvent)
    private eventRepository: Repository<TraceabilityEvent>,
  ) {}

  async findByTrackingCode(trackingCode: string): Promise<InventoryBatch> {
    const batch = await this.batchRepository.findOne({
      where: { trackingCode },
      relations: ['product', 'product.workshop', 'product.artisan', 'product.category', 'events'],
      order: { events: { timestamp: 'ASC' } },
    });
    if (!batch) throw new NotFoundException('Código de trazabilidad no encontrado');
    return batch;
  }

  async findAllBatches(): Promise<InventoryBatch[]> {
    return this.batchRepository.find({
      relations: ['product', 'product.workshop', 'product.artisan', 'events'],
      order: { createdAt: 'DESC' },
    });
  }

  async addEvent(
    batchId: string,
    eventData: { stage: TraceabilityStage; title: string; description: string; loggedBy?: string },
  ): Promise<TraceabilityEvent> {
    const batch = await this.batchRepository.findOne({ where: { id: batchId } });
    if (!batch) throw new NotFoundException('Lote no encontrado');

    const event = this.eventRepository.create({
      batchId: batch.id,
      stage: eventData.stage,
      title: eventData.title,
      description: eventData.description,
      loggedBy: eventData.loggedBy || 'Administración San Roque',
    });

    const saved = await this.eventRepository.save(event);
    batch.batchStatus = eventData.stage;
    await this.batchRepository.save(batch);

    return saved;
  }
}
