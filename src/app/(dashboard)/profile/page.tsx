import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";

const ProfilePage = async () => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role;

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
    return (
      <div className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <p className="text-gray-600">User data not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="flex items-center gap-4 mb-6">
          <Image
            src={user.img || "/noAvatar.png"}
            alt="Avatar"
            width={80}
            height={80}
            className="rounded-full"
          />
          <div>
            <h2 className="text-xl font-semibold">
              {user.name} {user.surname}
            </h2>
            <p className="text-gray-600 capitalize">{role}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Phone:</strong> {user.phone || "N/A"}</p>
            <p><strong>Address:</strong> {user.address || "N/A"}</p>
            <p><strong>Blood Type:</strong> {user.bloodType || "N/A"}</p>
            <p><strong>Sex:</strong> {user.sex || "N/A"}</p>
            <p><strong>Birthday:</strong> {user.birthday ? new Date(user.birthday).toLocaleDateString() : "N/A"}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Role-Specific Information</h3>
            {role === "student" && (
              <>
                <p><strong>Class:</strong> {roleSpecificData.class || "N/A"}</p>
                <p><strong>Grade:</strong> {roleSpecificData.grade || "N/A"}</p>
                <p><strong>Parent:</strong> {roleSpecificData.parent}</p>
              </>
            )}
            {role === "teacher" && (
              <>
                <p><strong>Subjects:</strong> {roleSpecificData.subjects || "N/A"}</p>
                <p><strong>Classes:</strong> {roleSpecificData.classes || "N/A"}</p>
              </>
            )}
            {role === "parent" && (
              <p><strong>Students:</strong> {roleSpecificData.students || "N/A"}</p>
            )}
            {role === "admin" && (
              <p>No additional role-specific information.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
