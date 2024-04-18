import { seedImageProduct } from './seed_image_product';
import { seedImages } from './seed_images';
import { seedProducts } from './seed_products';


async function seed() {
  console.log('Start seeding ...');
  await seedImages();
  await seedProducts();
  await seedImageProduct();
  console.log('Seeding finished.');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
