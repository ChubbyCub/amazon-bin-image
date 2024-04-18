import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();

export async function seedImageProduct() {
    const imageProducts: { name: string, asin: string, quantity: number }[] = [];

    fs.createReadStream('./prisma/image_product.csv')
      .pipe(csv())
      .on('data', (data) => imageProducts.push({
        name: data.name,
        asin: data.asin,
        quantity: parseInt(data.quantity) // Ensure this is used only for `quantity`
      }))
      .on('end', async () => {
          await prisma.$connect();
          
          const results = imageProducts.map(async (imageProduct) => {
            const image = await prisma.image.findUnique({
              where: { name: imageProduct.name },
              select: { uuid: true }
            });
            const product = await prisma.product.findUnique({
              where: { asin: imageProduct.asin },
              select: { uuid: true }
            });
            // Safely handle potentially undefined UUIDs by defaulting to undefined explicitly
            return [
              image?.uuid ?? undefined,
              product?.uuid ?? undefined,
              imageProduct.quantity
            ];
          });

          const resolvedResults = await Promise.all(results);

          for (const [imageUUID, productUUID, quantity] of resolvedResults) {
            if (typeof imageUUID === 'string' && typeof productUUID === 'string' && typeof quantity === 'number') {
              await prisma.imageProduct.create({
                data: {
                  image_uuid: imageUUID,
                  product_uuid: productUUID,
                  quantity: quantity
                }
              });
            } else {
              console.error('Missing or invalid UUID for image or product:', imageUUID, productUUID);
            }
          }

          await prisma.$disconnect();
      });
}

