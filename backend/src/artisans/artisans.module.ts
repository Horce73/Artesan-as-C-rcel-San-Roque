import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artisan } from '../entities/artisan.entity';
import { ArtisansService } from './artisans.service';
import { ArtisansController } from './artisans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Artisan])],
  providers: [ArtisansService],
  controllers: [ArtisansController],
  exports: [ArtisansService],
})
export class ArtisansModule {}
