import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all payments
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId");

    const where: any = {};
    
    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            student: true,
          },
        },
        recordedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Record a new payment
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { invoiceId, amount, paymentMethod, transactionId } = body;

    if (!invoiceId || !amount || !paymentMethod) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Generate payment reference
    const ref = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          paymentMethod,
          transactionId: transactionId || null,
          reference: ref,
          recordedById: userId,
        },
        include: {
          invoice: true,
          recordedBy: true,
        },
      });

      // Update the invoice
      const invoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: {
            increment: amount,
          },
        },
      });

      // Update invoice status based on payment
      if (invoice.paidAmount + amount >= invoice.totalAmount) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID" },
        });
      } else if (invoice.paidAmount + amount > 0) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: "PARTIALLY_PAID" },
        });
      }

      return payment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error recording payment:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
