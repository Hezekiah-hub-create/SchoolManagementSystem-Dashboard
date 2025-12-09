import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { role } from "@/lib/data";
import prisma from "@/lib/prisma";
import { Result, Student, Exam, Assignment, Subject, Class, Teacher, Prisma } from "@prisma/client";
import Image from "next/image";
import { ITEM_PER_PAGE } from "@/lib/settings";

type ResultList = Result & { student: Student } & { exam?: Exam & { lesson: { subject: Subject; class: Class; teacher: Teacher } } } & { assignment?: Assignment & { lesson: { subject: Subject; class: Class; teacher: Teacher } } };

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Student",
    accessor: "student",
  },
  {
    header: "Score",
    accessor: "score",
    className: "hidden md:table-cell",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Class",
    accessor: "class",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ResultListPage = async ({ searchParams }: { searchParams: any }) => {
  const resolvedSearchParams = await searchParams;
  const { page, ...queryParams } = resolvedSearchParams ?? {};
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.ResultWhereInput = {}

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value as string;
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value as string, mode: "insensitive" } } },
              { student: { name: { contains: value as string, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }


  const [data, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: true,
        exam: {
          include: {
            lesson: {
              include: { subject: true, class: true, teacher: true },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              include: { subject: true, class: true, teacher: true },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
      orderBy: { id: 'asc' },
    }),
    prisma.result.count({ where: query }),
  ]);

  const renderRow = (item: ResultList) => {
    const subject = item.exam?.lesson.subject.name || item.assignment?.lesson.subject.name || '';
    const className = item.exam?.lesson.class.name || item.assignment?.lesson.class.name || '';
    const teacher = item.exam?.lesson.teacher.name || item.assignment?.lesson.teacher.name || '';
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">{subject}</td>
        <td>{item.student.name}</td>
        <td className="hidden md:table-cell">{item.score}</td>
        <td className="hidden md:table-cell">{teacher}</td>
        <td className="hidden md:table-cell">{className}</td>
        <td className="hidden md:table-cell">{item.exam?.startTime.toISOString().split('T')[0] || item.assignment?.startDate.toISOString().split('T')[0] || ''}</td>
        <td>
          <div className="flex items-center gap-2">
            <FormModal table="result" type="view" data={item} />
            {(role === "admin" || role === "teacher") && (
              <>
                <FormModal table="result" type="update" data={item} />
                <FormModal table="result" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ZekPurple">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-ZekPurple">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && <FormModal table="result" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ResultListPage;
