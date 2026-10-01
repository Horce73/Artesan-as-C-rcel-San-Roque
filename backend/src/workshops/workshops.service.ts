import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workshop } from '../entities/workshop.entity';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private workshopRepository: Repository<Workshop>,
  ) {}

  findAll(): Promise<Workshop[]> {
    return this.workshopRepository.find({ relations: ['artisans'] });
  }

  async findOne(id: string): Promise<Workshop> {
    const workshop = await this.workshopRepository.findOne({ where: { id }, relations: ['artisans', 'products'] });
    if (!workshop) throw new NotFoundException('Taller no encontrado');
    return workshop;
  }

  create(data: Partial<Workshop>): Promise<Workshop> {
    const workshop = this.workshopRepository.create(data);
    return this.workshopRepository.save(workshop);
  }

  async update(id: string, data: Partial<Workshop>): Promise<Workshop> {
    await this.workshopRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.workshopRepository.delete(id);
  }
}
