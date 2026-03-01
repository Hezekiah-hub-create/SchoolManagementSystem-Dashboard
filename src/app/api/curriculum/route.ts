import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all curriculum
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const gradeId = searchParams.get("gradeId");

    const where: any = {};
    
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (gradeId) where.gradeId = parseInt(gradeId);

    const curriculum = await prisma.curriculum.findMany({
      where,
      include: {
        subject: true,
        grade: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(curriculum);
  } catch (error) {
    console.error("Error fetching curriculum:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new curriculum
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { subjectId, gradeId, topics, objectives, outcomes } = body;

    if (!subjectId || !gradeId || !objectives || !outcomes) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const curriculum = await prisma.curriculum.create({
      data: {
        subjectId: parseInt(subjectId),
        gradeId: parseInt(gradeId),
        topics: topics || [],
        objectives,
        outcomes,
      },
      include: {
        subject: true,
        grade: true,
      },
    });

    return NextResponse.json(curriculum);
  } catch (error) {
    console.error("Error creating curriculum:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
