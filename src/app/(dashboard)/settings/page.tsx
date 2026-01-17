import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Image from "next/image";
import FormModal from "@/components/FormModal";

const SettingsPage = async () => {
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
          <h1 className="text-2xl font-bold mb-4">Settings</h1>
          <p className="text-gray-600">User data not found.</p>
        </div>
      </div>
    );
  }

  // Fetch current settings
  const settingsRecords = await prisma.$queryRaw<Array<{ category: string; data: any }>>`SELECT "category", "data" FROM "Settings"`;
  const currentSettings = settingsRecords.reduce((acc: Record<string, any>, record: any) => {
    acc[record.category] = record.data;
    return acc;
  }, {} as Record<string, any>);

  const settingsCategories = [
    { key: "generalSchool", title: "General School Settings", description: "School name, logo, motto, address, contact, academic year, working days, time zone, language" },
    { key: "userRoleManagement", title: "User & Role Management", description: "User roles, permissions, account management, password policies, 2FA" },
    { key: "academic", title: "Academic Settings", description: "Class configuration, subjects, grading system, curriculum, course credits" },
    { key: "student", title: "Student Settings", description: "Admission format, categories, house system, ID cards, discipline rules, attendance" },
    { key: "teacher", title: "Teacher & Staff Settings", description: "Staff designations, teaching load, payroll, leave policies, attendance rules" },
    { key: "examination", title: "Examination & Assessment Settings", description: "Exam types, assessment weighting, timetable rules, result controls, pass criteria" },
    { key: "fees", title: "Fees & Finance Settings", description: "Fee structure, payment methods, currency, invoices, penalties, discounts" },
    { key: "attendance", title: "Attendance Settings", description: "Marking methods, auto-close time, notifications, biometric integration" },
    { key: "communication", title: "Communication & Notification Settings", description: "Email/SMS configuration, push notifications, announcement controls" },
    { key: "timetable", title: "Timetable Settings", description: "Period duration, breaks, classroom allocation, conflict detection" },
    { key: "library", title: "Library Settings", description: "Book categories, borrowing limits, fine calculation, return periods" },
    { key: "transport", title: "Transport Settings", description: "Routes, fees, vehicle details, student assignment" },
    { key: "hostel", title: "Hostel / Boarding Settings", description: "Room configuration, allocation rules, fees, permissions" },
    { key: "security", title: "System & Security Settings", description: "Data backup, audit logs, session timeout, IP restrictions" },
    { key: "ui", title: "Customization & UI Settings", description: "Theme, dashboard layout, custom fields, branding" },
    { key: "integration", title: "Integration Settings", description: "Payment gateways, LMS, API access, third-party tools" },
    { key: "data", title: "Data & Export Settings", description: "Import/export formats, archiving, retention policies" },
    { key: "mobile", title: "Mobile App Settings", description: "Access control, feature visibility, offline settings" }
  ];

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>

        {/* Admin Settings Section */}
        {role === "admin" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">System Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settingsCategories.map((category) => (
                <div key={category.key} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                  <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
                    Configure (Coming Soon)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
