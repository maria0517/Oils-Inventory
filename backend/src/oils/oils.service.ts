import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOilDto } from './dto/create-oil.dto';
import { Readable } from 'stream';
import csv from 'csv-parser';

@Injectable()
export class OilsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createOilDto: CreateOilDto) {
    return this.prisma.oil.create({
      data: {
        ...createOilDto,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.oil.findMany({
      where: { userId },
      orderBy: { nameRo: 'asc' },
    });
  }

  async findOneByName(userId: number, name: string) {
    const oil = await this.prisma.oil.findFirst({
      where: {
        userId,
        OR: [
          { nameRo: { equals: name, mode: 'insensitive' } },
          { nameEn: { equals: name, mode: 'insensitive' } },
        ],
      },
    });

    if (!oil) {
      throw new NotFoundException(`Uleiul "${name}" nu a fost găsit.`);
    }

    return oil;
  }

  async findOne(userId: number, id: number) {
    const oil = await this.prisma.oil.findFirst({
      where: { id, userId },
    });

    if (!oil) {
      throw new NotFoundException(`Uleiul cu id-ul ${id} nu a fost găsit.`);
    }

    return oil;
  }

  async update(userId: number, id: number, updateData: Partial<CreateOilDto>) {
    await this.findOne(userId, id);

    return this.prisma.oil.update({
      where: { id },
      data: updateData as any,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);

    return this.prisma.oil.delete({
      where: { id },
    });
  }

  async importCsv(userId: number, buffer: Buffer) {
    const parsedRows: Array<{
      nameRo: string;
      nameEn: string;
      smallBottles: number;
      largeBottles: number;
      description?: string;
    }> = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer);
      stream
        .pipe(csv())
        .on('data', (row: Record<string, string>) => {
          const nameRo = row.nameRo || row.NumeRo || row.nume || row.name || '';
          const nameEn = row.nameEn || row.NumeEn || row.name || row.Name || nameRo;
          const smallBottles = parseInt(row.smallBottles || row.small || row.stocMic || '0', 10);
          const largeBottles = parseInt(row.largeBottles || row.large || row.stocMare || '0', 10);
          const description = row.description || row.descriere || '';

          if (nameRo.trim() || nameEn.trim()) {
            parsedRows.push({
              nameRo: nameRo.trim() || nameEn.trim(),
              nameEn: nameEn.trim() || nameRo.trim(),
              smallBottles: isNaN(smallBottles) ? 0 : smallBottles,
              largeBottles: isNaN(largeBottles) ? 0 : largeBottles,
              description: description.trim(),
            });
          }
        })
        .on('end', async () => {
          try {
            if (parsedRows.length === 0) {
              return reject(new BadRequestException('Fișierul CSV nu conține rânduri valide.'));
            }

            await this.prisma.$transaction(
              parsedRows.map((oil) =>
                this.prisma.oil.create({
                  data: {
                    ...oil,
                    userId,
                  },
                })
              )
            );

            resolve({
              message: 'Import finalizat cu succes!',
              count: parsedRows.length,
            });
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => reject(err));
    });
  }
}