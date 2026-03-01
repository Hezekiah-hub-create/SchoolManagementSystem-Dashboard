import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all invoices or filter by student
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    const where: any = {};
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        items: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new invoice
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { studentId, items, dueDate, description } = body;

    if (!studentId || !items || !dueDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate invoice number
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.amount * item.quantity);
    }, 0);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        studentId,
        totalAmount,
        dueDate: new Date(dueDate),
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            amount: item.amount,
            quantity: item.quantity || 1,
          })),
        },
      },
      include: {
        student: true,
        items: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error creating invoice:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
