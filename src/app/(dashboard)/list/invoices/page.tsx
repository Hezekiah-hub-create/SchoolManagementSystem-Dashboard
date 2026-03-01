import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Image from "next/image";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

type InvoiceList = {
  id: string;
  invoiceNumber: string;
  studentId: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  student?: {
    name: string;
    surname: string;
  };
};

const columns = [
  {
    header: "Invoice #",
    accessor: "invoiceNumber",
  },
  {
    header: "Student",
    accessor: "student",
    className: "hidden md:table-cell",
  },
  {
    header: "Amount",
    accessor: "amount",
    className: "hidden md:table-cell",
  },
  {
    header: "Paid",
    accessor: "paid",
    className: "hidden lg:table-cell",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden lg:table-cell",
  },
  {
    header: "Due Date",
    accessor: "dueDate",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: InvoiceList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ZekPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold">{item.invoiceNumber}</h3>
      </div>
    </td>
    <td className="hidden md:table-cell">
      {item.student ? `${item.student.name} ${item.student.surname}` : 'N/A'}
    </td>
    <td className="hidden md:table-cell">¢{item.totalAmount.toFixed(2)}</td>
    <td className="hidden lg:table-cell">¢{item.paidAmount.toFixed(2)}</td>
    <td className="hidden lg:table-cell">
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          item.status === "PAID"
            ? "bg-green-100 text-green-800"
            : item.status === "OVERDUE"
            ? "bg-red-100 text-red-800"
            : item.status === "PARTIALLY_PAID"
            ? "bg-blue-100 text-blue-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {item.status.replace("_", " ")}
      </span>
    </td>
    <td className="hidden lg:table-cell">
      {format(new Date(item.dueDate), "MMM d, yyyy")}
    </td>
    <td>
      <div className="flex items-center gap-2">
        <FormModal table="invoice" type="update" data={item} />
        <FormModal table="invoice" type="view" data={item} />
      </div>
    </td>
  </tr>
);

const InvoiceListPage = async ({ searchParams }: { searchParams: any }) => {
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
            query.invoiceNumber = { contains: value as string, mode: "insensitive" };
            break;
          case "status":
            query.status = value as string;
            break;
          default:
            break;
        }
      }
    }
  }

  // Only admin and parents can view invoices
  if (role !== "admin" && role !== "parent") {
    return <div className="p-4">Access denied</div>;
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.invoice.findMany({
        where: query,
        take: 10,
        skip: (p - 1) * 10,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          student: true,
        },
      }),
      prisma.invoice.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">All Invoices</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              {role === "admin" && <FormContainer table="invoice" type="create" />}
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
    console.error("Error fetching invoices:", error);
    return <div className="p-4">Error loading invoices</div>;
  }
};

export default InvoiceListPage;
