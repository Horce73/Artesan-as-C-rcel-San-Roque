import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryBatch } from '../entities/inventory-batch.entity';
import { TraceabilityEvent } from '../entities/traceability-event.entity';
import { TraceabilityService } from './traceability.service';
import { TraceabilityController } from './traceability.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryBatch, TraceabilityEvent])],
  providers: [TraceabilityService],
  controllers: [TraceabilityController],
  exports: [TraceabilityService],
})
export class TraceabilityModule {}
