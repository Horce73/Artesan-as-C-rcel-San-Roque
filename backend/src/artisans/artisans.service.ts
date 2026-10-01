import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Artisan } from '../entities/artisan.entity';

@Injectable()
export class ArtisansService {
  constructor(
    @InjectRepository(Artisan)
    private artisanRepository: Repository<Artisan>,
  ) {}

  findAll(): Promise<Artisan[]> {
    return this.artisanRepository.find({ relations: ['workshop'] });
  }

  async findOne(id: string): Promise<Artisan> {
    const artisan = await this.artisanRepository.findOne({ where: { id }, relations: ['workshop', 'products'] });
    if (!artisan) throw new NotFoundException('Artesano no encontrado');
    return artisan;
  }

  create(data: Partial<Artisan>): Promise<Artisan> {
    const artisan = this.artisanRepository.create(data);
    return this.artisanRepository.save(artisan);
  }

  async update(id: string, data: Partial<Artisan>): Promise<Artisan> {
    await this.artisanRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.artisanRepository.delete(id);
  }
}
