import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOilDto } from './dto/create-oil.dto';

@Injectable()
export class OilsService {
  // 1. Dependency Injection: cerem instanța de PrismaService
  constructor(private prisma: PrismaService) {}

  // aduc toate de la a la z
  findAll() {
    return this.prisma.oil.findMany({
      orderBy: { nameRo: 'asc' },
    });
  }

  // un singur ulei dupa id
  findOne(id: number) {
    return this.prisma.oil.findUnique({
      where: { id },
    });
  }

  // ulei dupa nume eng
  findOneByName(name: string) {
  return this.prisma.oil.findUnique({
    where: {
      nameEn: name,
    },
  });
}

  // ulei nou
  create(data: CreateOilDto) {
    return this.prisma.oil.create({
      data: {
        nameRo: data.nameRo,
        nameEn: data.nameEn,
        smallBottles: data.smallBottles ?? 0,
        largeBottles: data.largeBottles ?? 0,
      },
    });
  }

  update(id: number, data: Partial<CreateOilDto>) {
    return this.prisma.oil.update({
      where: { id },
      data,
    });
  }

  // sterge ulei
  remove(id: number) {
    return this.prisma.oil.delete({
      where: { id },
    });
  }

}
