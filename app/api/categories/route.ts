import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { categoryName } = await request.json();

    if (!categoryName) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const newCategory = await prisma.category.create({
      data: { categoryName },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: {
      categoryName: 'asc',
    },
  });
  return NextResponse.json(categories);
}