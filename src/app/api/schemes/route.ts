import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all schemes of learning
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");

    const where: any = {};
    
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (classId) where.classId = parseInt(classId);
    if (teacherId) where.teacherId = teacherId;

    const schemes = await prisma.schemeOfLearning.findMany({
      where,
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(schemes);
  } catch (error) {
    console.error("Error fetching schemes:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new scheme of learning
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, subjectId, classId, term, year, weeks, objectives } = body;

    if (!title || !subjectId || !classId || !term || !year || !objectives) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const scheme = await prisma.schemeOfLearning.create({
      data: {
        title,
        subjectId: parseInt(subjectId),
        classId: parseInt(classId),
        teacherId: userId,
        term,
        year: parseInt(year),
        weeks: weeks || [],
        objectives,
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });

    return NextResponse.json(scheme);
  } catch (error) {
    console.error("Error creating scheme:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
