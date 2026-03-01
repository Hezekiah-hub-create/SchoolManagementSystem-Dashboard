import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get financial reports - income/expenditure, balance sheet, receivables
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "income-expenditure", "balance-sheet", "receivables", "summary"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Income-Expenditure Report
    if (type === "income-expenditure") {
      const incomes = await prisma.finance.findMany({
        where: {
          type: "income",
          date: dateFilter,
        },
      });
      
      const expenses = await prisma.finance.findMany({
        where: {
          type: "expense",
          date: dateFilter,
        },
      });

      const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
      const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

      return NextResponse.json({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        incomes,
        expenses,
      });
    }

    // Balance Sheet
    if (type === "balance-sheet") {
      const incomes = await prisma.finance.findMany({
        where: { type: "income" },
      });
      const expenses = await prisma.finance.findMany({
        where: { type: "expense" },
      });

      // Get receivables (unpaid invoices)
      const receivables = await prisma.invoice.findMany({
        where: {
          status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] },
        },
        include: {
          student: true,
        },
      });

      const totalReceivables = receivables.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

      const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
      const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

      return NextResponse.json({
        assets: {
          receivables: totalReceivables,
          total: totalReceivables,
        },
        liabilities: {
          // Add more liability calculations as needed
          total: 0,
        },
        equity: {
          totalIncome,
          totalExpense,
          netAssets: totalIncome - totalExpense - totalReceivables,
        },
        receivables: receivables,
      });
    }

    // Account Receivables
    if (type === "receivables") {
      const invoices = await prisma.invoice.findMany({
        where: {
          status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] },
        },
        include: {
          student: {
            include: {
              parent: true,
            },
          },
          payments: true,
        },
        orderBy: {
          dueDate: "asc",
        },
      });

      const totalReceivables = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

      // Group by status
      const byStatus = {
        pending: invoices.filter(inv => inv.status === "PENDING"),
        partiallyPaid: invoices.filter(inv => inv.status === "PARTIALLY_PAID"),
        overdue: invoices.filter(inv => inv.status === "OVERDUE"),
      };

      return NextResponse.json({
        invoices,
        totalReceivables,
        count: invoices.length,
        byStatus,
      });
    }

    // Default: Financial Summary
    const allFinances = await prisma.finance.findMany({
      where: dateFilter.date ? { date: dateFilter } : undefined,
    });

    const totalIncome = allFinances
      .filter(f => f.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = allFinances
      .filter(f => f.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    // Get payments from invoices
    const payments = await prisma.payment.findMany({
      where: dateFilter.date ? { createdAt: dateFilter } : undefined,
    });

    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

    // Get pending invoices
    const pendingInvoices = await prisma.invoice.findMany({
      where: { status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] } },
    });

    const totalPending = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      totalPayments,
      totalPending,
      invoiceCount: pendingInvoices.length,
    });
  } catch (error) {
    console.error("Error fetching finance reports:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
