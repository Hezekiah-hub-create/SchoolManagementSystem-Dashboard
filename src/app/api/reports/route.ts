import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Get all academic reports
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const term = searchParams.get("term");
    const academicYear = searchParams.get("academicYear");

    const where: any = {};
    
    if (studentId) where.studentId = studentId;
    if (term) where.term = term;
    if (academicYear) where.academicYear = parseInt(academicYear);

    const reports = await prisma.academicReport.findMany({
      where,
      include: {
        student: true,
      },
      orderBy: {
        generatedAt: "desc",
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Generate a new academic report
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { studentId, term, academicYear, subjects, teacherComments, principalComments } = body;

    if (!studentId || !term || !academicYear) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Calculate average score from subjects
    let totalScore = 0;
    let subjectCount = 0;
    
    if (subjects && Array.isArray(subjects)) {
      subjects.forEach((subject: any) => {
        if (subject.score !== undefined) {
          totalScore += subject.score;
          subjectCount++;
        }
      });
    }

    const averageScore = subjectCount > 0 ? totalScore / subjectCount : 0;

    // Get student's attendance rate
    const studentAttendances = await prisma.attendance.findMany({
      where: { studentId },
    });

    const presentCount = studentAttendances.filter(a => a.present).length;
    const attendanceRate = studentAttendances.length > 0 
      ? (presentCount / studentAttendances.length) * 100 
      : 0;

    // Get class position (simplified - just count students with higher average)
    const allStudentsInClass = await prisma.student.findMany({
      where: {
        classId: (await prisma.student.findUnique({ where: { id: studentId } }))?.classId,
      },
      include: {
        results: true,
      },
    });

    // For simplicity, we'll skip position calculation for now

    const report = await prisma.academicReport.create({
      data: {
        studentId,
        term,
        academicYear: parseInt(academicYear),
        averageScore,
        attendanceRate,
        teacherComments: teacherComments || "",
        principalComments: principalComments || null,
        subjects: subjects || {},
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating report:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
