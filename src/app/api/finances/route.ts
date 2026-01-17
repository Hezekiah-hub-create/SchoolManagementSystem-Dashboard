import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const finances = await prisma.finance.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(finances);
  } catch (error) {
    console.error("Error fetching finances:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { type, amount, description, date } = body;

    const finance = await prisma.finance.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
      },
    });

    return NextResponse.json(finance, { status: 201 });
  } catch (error) {
    console.error("Error creating finance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, type, amount, description, date } = body;

    const finance = await prisma.finance.update({
      where: { id: parseInt(id) },
      data: {
        type,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
      },
    });

    return NextResponse.json(finance);
  } catch (error) {
    console.error("Error updating finance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.finance.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Finance deleted successfully" });
  } catch (error) {
    console.error("Error deleting finance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
