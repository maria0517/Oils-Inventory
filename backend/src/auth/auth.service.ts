import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credențiale invalide');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credențiale invalide');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
    access_token: this.jwtService.sign(payload),
    role: user.role, // îl trimitem și frontend-ului
    };
  }

  async register(email: string, pass: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new UnauthorizedException('Acest email este deja înregistrat');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
        data: {
        email,
        password: hashedPassword,
        },
    });

    const payload = { sub: user.id, email: user.email };
    return {
        access_token: this.jwtService.sign(payload),
    };
}
}