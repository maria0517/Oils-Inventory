import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('parolata123', 10);

  // 1. Creează sau preia utilizatorul admin
  const user = await prisma.user.upsert({
    where: { email: 'admin@uleiuri.ro' },
    update: {},
    create: {
      email: 'admin@uleiuri.ro',
      password: hashedPassword,
    },
  });

  console.log(`Utilizator pregătit: ${user.email} (id: ${user.id})`);

  // 2. Uleiuri inițiale de test pentru acest utilizator
  const initialOils = [
    { nameRo: 'Lavandă', nameEn: 'Lavender', smallBottles: 2, largeBottles: 1, category: 'Simple' },
    { nameRo: 'Mentă', nameEn: 'Peppermint', smallBottles: 1, largeBottles: 3, category: 'Simple' },
    { nameRo: 'Tămâie', nameEn: 'Frankincense', smallBottles: 0, largeBottles: 2, category: 'Simple' },
    { nameRo: 'Lămâie', nameEn: 'Lemon', smallBottles: 5, largeBottles: 0, category: 'Simple' },
  ];

  for (const oil of initialOils) {
    await prisma.oil.upsert({
      where: {
        nameEn_userId: {
          nameEn: oil.nameEn,
          userId: user.id,
        },
      },
      update: {
        smallBottles: oil.smallBottles,
        largeBottles: oil.largeBottles,
      },
      create: {
        nameRo: oil.nameRo,
        nameEn: oil.nameEn,
        smallBottles: oil.smallBottles,
        largeBottles: oil.largeBottles,
        userId: user.id,
      },
    });
  }

  console.log('Seed rulat cu succes!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });