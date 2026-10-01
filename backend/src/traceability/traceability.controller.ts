import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TraceabilityService } from './traceability.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/jwt.strategy';
import { UserRole } from '../entities/user.entity';

@Controller('traceability')
export class TraceabilityController {
  constructor(private readonly traceabilityService: TraceabilityService) {}

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.traceabilityService.findByTrackingCode(code);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('batches')
  findAllBatches() {
    return this.traceabilityService.findAllBatches();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('event/:batchId')
  addEvent(@Param('batchId') batchId: string, @Body() body: any) {
    return this.traceabilityService.addEvent(batchId, body);
  }
}
