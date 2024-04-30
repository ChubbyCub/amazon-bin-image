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
        image_uuid: true,
        product_uuid: true,
        quantity: true
      }
    });
    
    const productName = await prisma.product.findUnique({
      where: {
        uuid: productUuid
      },
      select: {
        name: true
      }
    })
    let imageProducts: Array<
      {product_uuid: string, product_name: string | undefined, quantity: number, image_uuid: string | undefined}
    > = []
    if (imageProductRecords.length == 0) {
      imageProducts.push({product_uuid: productUuid, product_name: productName?.name, quantity: 0, image_uuid: undefined})
    } else {
      for (const record of imageProductRecords) {
        imageProducts.push({...record, product_name: productName?.name})
      }
    }
    // filter by the record results, meaning some products that do not have images will not be on this list
    const imageUuids = imageProductRecords.map(record => record.image_uuid);

    const imageUrlRecords = await prisma.image.findMany({
      where: {
        uuid: {
          in: imageUuids
        }
      },
      select: {
        image_s3_url: true,
        uuid: true
      }
    });
    
    const imageUrls = imageProducts.map(imageProduct => {
      // Attempt to find a corresponding image URL record.
      const imageUrlRecord = imageUrlRecords.find(record => record.uuid === imageProduct.image_uuid);
      
      // Construct the new object with either the found URL or undefined.
      return {
        ...imageProduct,
        image_s3_url: imageUrlRecord ? imageUrlRecord.image_s3_url : undefined
      };
    });

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