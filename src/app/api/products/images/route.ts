import { Prisma, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Define the type for the records as they include the associated image
type ImageProductWithImage = { 
  uuid: string;
    image_uuid: string;
    quantity: number;
    product_uuid: string;
    image: {
        uuid: string;
        name: string;
        meta_data: Prisma.JsonValue;
        image_s3_url: string;
        created_at: Date;
    };
  }

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  // 1:1 relationship. productId[i] will map to quantities[i]
  const searchQuantities = request.nextUrl.searchParams.get("quantities")?.split(",");
  const searchProductIds = request.nextUrl.searchParams.get("ids")?.split(",");
  if (searchQuantities === undefined || searchProductIds === undefined) {
    return new NextResponse(JSON.stringify({ error: 'Missing search params' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  const conditions = searchProductIds.map((productId, index) => ({
    product_uuid: productId,
    quantity: parseInt(searchQuantities[index])
  }));

  try {
    const imageProductRecords: ImageProductWithImage[] = await prisma.imageProduct.findMany({
      where: {
        OR: conditions
      },
      include: {
        image: true
      },
    });
    
    let imageMap: Map<string, ImageProductWithImage[]> = new Map();

    for (const record of imageProductRecords) {
      if(!imageMap.get(record.image_uuid)) {
        imageMap.set(record.image_uuid, [])
      }
      imageMap.get(record.image_uuid)!.push(record)
    }
    let imageUrls: string[] = []

    for (const [image_uuid, records] of imageMap) {
      if(imageMap.get(image_uuid)?.length === searchProductIds.length) {
        records.forEach(record => {
          const url = record.image.image_s3_url;
          if(!imageUrls.includes(url)) {
            imageUrls.push(url)
          }
        });
      }
    }

    return new NextResponse(JSON.stringify(imageUrls), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch(error) {
    console.error('Failed to fetch product names:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch images' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}