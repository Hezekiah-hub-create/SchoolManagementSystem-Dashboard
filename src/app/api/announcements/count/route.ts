import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const count = await prisma.announcement.count();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching announcement count:", error);
    return NextResponse.json({ error: "Failed to fetch count" }, { status: 500 });
  }
}
