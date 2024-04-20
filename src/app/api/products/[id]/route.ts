import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const prisma = new PrismaClient();
  
  const searchParam = request.nextUrl.searchParams.get("quantity")
  
  let quantity = 0
  if (searchParam) {
    quantity = parseInt(searchParam)
  }
  
  const productUuid = params.id
  try {
    const imageProductRecords = await prisma.imageProduct.findMany({
      where: {
        product_uuid: productUuid,
        quantity
      },
      select: {
        image_uuid: true
      }
    });

    const imageUuids = imageProductRecords.map(record => record.image_uuid);

    const imageUrlRecords = await prisma.image.findMany({
      where: {
        uuid: {
          in: imageUuids
        }
      },
      select: {
        image_s3_url: true
      }
    });

    const imageUrls = imageUrlRecords.map(record => record.image_s3_url);

    return new NextResponse(JSON.stringify(imageUrls), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Failed to fetch product names:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch product names' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } finally {
    await prisma.$disconnect()
  }
}