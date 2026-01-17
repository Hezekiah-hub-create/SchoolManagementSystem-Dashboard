import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const { id } = await params;
    const userId = id;

    let user: any = null;
    let roleSpecificData: any = {};

    if (role === "student") {
      user = await prisma.student.findUnique({
        where: { id: userId },
        include: { class: { include: { grade: true } }, parent: true },
      });
      if (user) {
        roleSpecificData = {
          class: user.class?.name,
          grade: user.grade?.level,
          parent: user.parent ? `${user.parent.name} ${user.parent.surname}` : "N/A",
        };
      }
    } else if (role === "teacher") {
      user = await prisma.teacher.findUnique({
        where: { id: userId },
        include: { subjects: true, classes: true },
      });
      if (user) {
        roleSpecificData = {
          subjects: user.subjects.map((s: any) => s.name).join(", "),
          classes: user.classes.map((c: any) => c.name).join(", "),
        };
      }
    } else if (role === "parent") {
      user = await prisma.parent.findUnique({
        where: { id: userId },
        include: { students: true },
      });
      if (user) {
        roleSpecificData = {
          students: user.students.map((s: any) => `${s.name} ${s.surname}`).join(", "),
        };
      }
    } else if (role === "admin") {
      user = await prisma.admin.findUnique({
        where: { id: userId },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user, roleSpecificData });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
