import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';  // Correct usage

const prisma = new PrismaClient();

export async function seedImages() {
  const images: { name: string, meta_data: {}, image_s3_url: string }[] = [];
  // Read the CSV file
  fs.createReadStream('./prisma/image.csv')
    .pipe(csv())
    .on('data', (data) => images.push({
      name: data.name,
      meta_data: data.meta_data,
      image_s3_url: data.image_s3_url
    }))
    .on('end', async () => {
      // Connect to Prisma Client
      await prisma.$connect();

      // Use a transaction to insert multiple records
      const result = await prisma.$transaction(
        images.map((image) =>
          prisma.image.upsert({
            where: { name: image.name },
            update: image,
            create: image,
          })
        )
      );

      // Disconnect Prisma Client
      await prisma.$disconnect();

      console.log('Images have been successfully seeded!');
      console.log(`Seeded ${result.length} images.`);
    });
}

seedImages().catch((e) => {
  console.error(e);
  process.exit(1);
});
