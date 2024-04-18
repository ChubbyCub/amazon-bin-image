import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';  // Correct usage

const prisma = new PrismaClient();

export async function seedImageProduct() {
  const imageProducts: { name: string, asin: string, quantity: number }[] = [];
  // Read the CSV file
  fs.createReadStream('./prisma/image_product.csv')
    .pipe(csv())
    .on('data', (data) => imageProducts.push({
      name: data.name,
      asin: data.asin,
      quantity: parseInt(data.quantity)
    }))
    .on('end', async () => {
      await prisma.$connect();

      // Perform a transaction to fetch UUIDs and create entries
      const finalResults = await prisma.$transaction(async (prisma) => {
        const results = [];

        for (const imageProduct of imageProducts) {
          const image = await prisma.image.findUnique({
            where: { name: imageProduct.name },
            select: { uuid: true }
          });
          const product = await prisma.product.findUnique({
            where: { asin: imageProduct.asin },
            select: { uuid: true }
          });

          // Check if both UUIDs were found
          if (image && product) {
            const result = await prisma.imageProduct.create({
              data: {
                image_uuid: image.uuid,
                product_uuid: product.uuid,
                quantity: imageProduct.quantity
              }
            });
            results.push(result);
          }
        }
        return results;
      });
      
      await prisma.imageProduct.createMany({
        data: finalResults,
        skipDuplicates: true
      })
      
      await prisma.$disconnect()
      
      console.log('ImageProduct relations have been successfully seeded!');
    });
}