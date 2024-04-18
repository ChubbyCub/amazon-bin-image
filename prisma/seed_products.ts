import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';  // Correct usage

const prisma = new PrismaClient();

export async function seedProducts() {
  const products: { asin: string; name: string }[] = [];

  // Read the CSV file
  fs.createReadStream('./prisma/product.csv')
    .pipe(csv())
    .on('data', (data) => products.push({
      asin: data.asin,
      name: data.name,
    }))
    .on('end', async () => {
      // Connect to Prisma Client
      await prisma.$connect();

      // Use a transaction to insert multiple records
      const result = await prisma.$transaction(
        products.map((product) =>
          prisma.product.upsert({
            where: { asin: product.asin },
            update: product,
            create: product,
          })
        )
      );

      // Disconnect Prisma Client
      await prisma.$disconnect();

      console.log('Products have been successfully seeded!');
      console.log(`Seeded ${result.length} products.`);
    });
}

seedProducts().catch((e) => {
  console.error(e);
  process.exit(1);
});
