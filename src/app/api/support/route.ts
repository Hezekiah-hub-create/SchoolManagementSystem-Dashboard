import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all support tickets
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const where: any = {};
    
    if (status) where.status = status;
    if (category) where.category = category;

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        responses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new support ticket
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { category, subject, description, userType, priority } = body;

    if (!category || !subject || !description) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        userType: userType || "PARENT",
        category,
        subject,
        description,
        priority: priority || "MEDIUM",
      },
      include: {
        responses: true,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
