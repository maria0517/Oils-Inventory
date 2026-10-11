import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Listează toți userii cu numărul lor de uleiuri
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { oils: true } },
      },
      orderBy: { id: 'asc' },
    });
  }

  // 2. Schimbă parola oricărui utilizator
  async resetPassword(userId: number, newPass: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilizatorul nu a fost găsit.');

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: `Parola pentru ${user.email} a fost actualizată cu succes.` };
  }

  // 3. Șterge un utilizator (și toate uleiurile lui automat)
  async deleteUser(userId: number) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  // 4. Vezi toate uleiurile unui utilizator specific
  async getUserOils(userId: number) {
    return this.prisma.oil.findMany({
      where: { userId },
      orderBy: { nameRo: 'asc' },
    });
  }

  // 5. Modifică direct stocul oricărui ulei
  async updateOilStock(oilId: number, data: { smallBottles?: number; largeBottles?: number }) {
    return this.prisma.oil.update({
      where: { id: oilId },
      data,
    });
  }
}