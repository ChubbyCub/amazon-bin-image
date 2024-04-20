import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  await prisma.$connect()
  try {
    // Fetch product names from the database
    const productNames = await prisma.product.findMany({
      select: { asin: true, name: true, uuid: true },
      take: 100
    });

    return new NextResponse(JSON.stringify(productNames), {
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