import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ArtisansService } from './artisans.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/jwt.strategy';
import { UserRole } from '../entities/user.entity';

@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  @Get()
  findAll() {
    return this.artisansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artisansService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() body: any) {
    return this.artisansService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.artisansService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.artisansService.remove(id);
  }
}
