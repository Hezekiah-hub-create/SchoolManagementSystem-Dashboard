import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

type SchemeList = {
  id: string;
  title: string;
  subjectId: number;
  classId: number;
  teacherId: string;
  term: string;
  year: number;
  createdAt: Date;
  subject?: {
    name: string;
  };
  class?: {
    name: string;
  };
  teacher?: {
    name: string;
    surname: string;
  };
};

const columns = [
  {
    header: "Title",
    accessor: "title",
  },
  {
    header: "Subject",
    accessor: "subject",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden md:table-cell",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden lg:table-cell",
  },
  {
    header: "Term",
    accessor: "term",
    className: "hidden lg:table-cell",
  },
  {
    header: "Year",
    accessor: "year",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: SchemeList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ZekPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.title}</h3>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.subject?.name || 'N/A'}
    </td>
    <td className="hidden md:table-cell">
      {item.class?.name || 'N/A'}
    </td>
    <td className="hidden lg:table-cell">
      {item.teacher ? `${item.teacher.name} ${item.teacher.surname}` : 'N/A'}
    </td>
    <td className="hidden lg:table-cell">{item.term}</td>
    <td className="hidden lg:table-cell">{item.year}</td>
    <td>
      <div className="flex items-center gap-2">
        <FormModal table="scheme" type="view" data={item} />
        <FormModal table="scheme" type="update" data={item} />
      </div>
    </td>
  </tr>
);

const SchemesPage = async ({ searchParams }: { searchParams: any }) => {
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
            query.title = { contains: value as string, mode: "insensitive" };
            break;
          case "subjectId":
            query.subjectId = parseInt(value as string);
            break;
          case "classId":
            query.classId = parseInt(value as string);
            break;
          case "teacherId":
            query.teacherId = value as string;
            break;
          default:
            break;
        }
      }
    }
  }

  // Teachers and admins can view schemes
  if (role !== "admin" && role !== "teacher") {
    return <div className="p-4">Access denied</div>;
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.schemeOfLearning.findMany({
        where: query,
        take: 10,
        skip: (p - 1) * 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      }),
      prisma.schemeOfLearning.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Schemes of Learning</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              {(role === "admin" || role === "teacher") && <FormContainer table="scheme" type="create" />}
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
    console.error("Error fetching schemes:", error);
    return <div className="p-4">Error loading schemes</div>;
  }
};

export default SchemesPage;
