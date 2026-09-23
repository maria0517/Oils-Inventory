import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(__dirname, 'uleiuri.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Imparte pe linii si elimina liniile goale
  const lines = fileContent.split(/\r?\n/).filter((line) => line.trim() !== '');
  
  // Sare peste header (nameRo,nameEn,smallBottles,largeBottles)
  const rows = lines.slice(1);

  console.log(`Se populeaza baza de date cu ${rows.length} uleiuri...`);

  for (const row of rows) {
    const [nameRo, nameEn, smallBottles, largeBottles] = row.split(',');

    await prisma.oil.upsert({
      where: { nameEn: nameEn.trim() },
      update: {
        smallBottles: parseInt(smallBottles, 10) || 0,
        largeBottles: parseInt(largeBottles, 10) || 0,
        nameRo: nameRo.trim(),
      },
      create: {
        nameRo: nameRo.trim(),
        nameEn: nameEn.trim(),
        smallBottles: parseInt(smallBottles, 10) || 0,
        largeBottles: parseInt(largeBottles, 10) || 0,
      },
    });
  }

  console.log('Popularea s-a incheiat cu succes!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
