import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

type TicketList = {
  id: string;
  userId: string;
  userType: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
};

const columns = [
  {
    header: "Category",
    accessor: "category",
  },
  {
    header: "Subject",
    accessor: "subject",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden md:table-cell",
  },
  {
    header: "Priority",
    accessor: "priority",
    className: "hidden md:table-cell",
  },
  {
    header: "Created",
    accessor: "date",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: TicketList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ZekPurpleLight"
  >
    <td className="p-4">
      <span className="font-medium">{item.category}</span>
    </td>
    <td className="p-4">
      <span className={item.status === "OPEN" ? "font-semibold" : ""}>
        {item.subject}
      </span>
    </td>
    <td className="hidden md:table-cell">
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          item.status === "RESOLVED" || item.status === "CLOSED"
            ? "bg-green-100 text-green-800"
            : item.status === "IN_PROGRESS"
            ? "bg-blue-100 text-blue-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {item.status}
      </span>
    </td>
    <td className="hidden md:table-cell">
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          item.priority === "URGENT" || item.priority === "HIGH"
            ? "bg-red-100 text-red-800"
            : item.priority === "MEDIUM"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {item.priority}
      </span>
    </td>
    <td className="hidden lg:table-cell">
      {format(new Date(item.createdAt), "MMM d, yyyy")}
    </td>
    <td>
      <div className="flex items-center gap-2">
        <FormModal table="support" type="view" data={item} />
        <FormModal table="support" type="update" data={item} />
      </div>
    </td>
  </tr>
);

const SupportPage = async ({ searchParams }: { searchParams: any }) => {
  const resolvedSearchParams = await searchParams;
  const { page, ...queryParams } = resolvedSearchParams ?? {};
  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    return <div className="p-4">Please log in to view support tickets</div>;
  }

  // URL PARAMS CONDITION
  const query: any = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { subject: { contains: value as string, mode: "insensitive" } },
              { description: { contains: value as string, mode: "insensitive" } },
            ];
            break;
          case "status":
            query.status = value as string;
            break;
          case "priority":
            query.priority = value as string;
            break;
          case "category":
            query.category = value as string;
            break;
          default:
            break;
        }
      }
    }
  }

  // Non-admin users can only see their own tickets
  if (role !== "admin") {
    query.userId = userId;
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.supportTicket.findMany({
        where: query,
        take: 10,
        skip: (p - 1) * 10,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.supportTicket.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Support Tickets</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <FormContainer table="support" type="create" />
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
    console.error("Error fetching support tickets:", error);
    return <div className="p-4">Error loading support tickets</div>;
  }
};

export default SupportPage;
