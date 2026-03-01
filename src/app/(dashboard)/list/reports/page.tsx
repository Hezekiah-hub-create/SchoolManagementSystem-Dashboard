import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

type ReportList = {
  id: string;
  studentId: string;
  term: string;
  academicYear: number;
  averageScore: number;
  classPosition: number | null;
  gradePosition: number | null;
  attendanceRate: number;
  teacherComments: string;
  generatedAt: Date;
  student?: {
    name: string;
    surname: string;
  };
};

const columns = [
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Term",
    accessor: "term",
    className: "hidden md:table-cell",
  },
  {
    header: "Year",
    accessor: "year",
    className: "hidden md:table-cell",
  },
  {
    header: "Average Score",
    accessor: "score",
    className: "hidden lg:table-cell",
  },
  {
    header: "Position",
    accessor: "position",
    className: "hidden lg:table-cell",
  },
  {
    header: "Attendance",
    accessor: "attendance",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: ReportList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ZekPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">
          {item.student ? `${item.student.name} ${item.student.surname}` : 'N/A'}
        </h3>
      </div>
    </td>
    <td className="hidden md:table-cell">{item.term}</td>
    <td className="hidden md:table-cell">{item.academicYear}</td>
    <td className="hidden lg:table-cell">
      <span
        className={`font-medium ${
          item.averageScore >= 80
            ? "text-green-600"
            : item.averageScore >= 60
            ? "text-yellow-600"
            : "text-red-600"
        }`}
      >
        {item.averageScore.toFixed(1)}%
      </span>
    </td>
    <td className="hidden lg:table-cell">
      {item.classPosition ? `#${item.classPosition}` : 'N/A'}
    </td>
    <td className="hidden lg:table-cell">{item.attendanceRate.toFixed(1)}%</td>
    <td>
      <div className="flex items-center gap-2">
        <FormModal table="report" type="view" data={item} />
      </div>
    </td>
  </tr>
);

const ReportsPage = async ({ searchParams }: { searchParams: any }) => {
  const resolvedSearchParams = await searchParams;
  const { page, ...queryParams } = resolvedSearchParams ?? {};
  const p = page ? parseInt(page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // URL PARAMS CONDITION
  const query: any = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.term = { contains: value as string, mode: "insensitive" };
            break;
          case "term":
            query.term = value as string;
            break;
          case "academicYear":
            query.academicYear = parseInt(value as string);
            break;
          default:
            break;
        }
      }
    }
  }

  // Teachers, parents and admins can view reports
  if (role !== "admin" && role !== "teacher" && role !== "parent") {
    return <div className="p-4">Access denied</div>;
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.academicReport.findMany({
        where: query,
        take: 10,
        skip: (p - 1) * 10,
        orderBy: {
          generatedAt: "desc",
        },
        include: {
          student: true,
        },
      }),
      prisma.academicReport.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Academic Reports</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="report" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <Table columns={columns} renderRow={renderRow} data={data} />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching reports:", error);
    return <div className="p-4">Error loading reports</div>;
  }
};

export default ReportsPage;
