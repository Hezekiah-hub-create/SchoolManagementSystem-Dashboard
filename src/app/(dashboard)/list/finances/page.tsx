import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Finance } from "@prisma/client";

type FinanceList = Finance;

const columns = [
  {
    header: "Type",
    accessor: "type",
  },
  {
    header: "Amount",
    accessor: "amount",
    className: "hidden md:table-cell",
  },
  {
    header: "Description",
    accessor: "description",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: FinanceList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ZekPurpleLight"
  >
    <td className="flex items-center gap-4 p-4">
      <div className="flex flex-col">
        <h3 className="font-semibold capitalize">{item.type}</h3>
      </div>
    </td>
    <td className="hidden md:table-cell">${item.amount.toFixed(2)}</td>
    <td className="hidden md:table-cell">{item.description}</td>
    <td className="hidden lg:table-cell">
      {new Date(item.date).toLocaleDateString()}
    </td>
    <td>
      <div className="flex items-center gap-2">
        <FormContainer table="finance" type="update" data={item} id={item.id} />
        <FormModal table="finance" type="delete" id={item.id} />
      </div>
    </td>
  </tr>
);

const FinanceListPage = async ({ searchParams }: { searchParams: any }) => {
  const resolvedSearchParams = await searchParams;
  const { page, ...queryParams } = resolvedSearchParams ?? {};
  const p = page ? parseInt(page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin") {
    return <div>Access denied</div>;
  }

  // URL PARAMS CONDITION
  const query: any = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.description = { contains: value as string, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.finance.findMany({
      where: query,
      take: 10, // ITEM_PER_PAGE_FINANCE
      skip: (p - 1) * 10,
      orderBy: {
        date: "desc",
      },
    }),
    prisma.finance.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Finances</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FormContainer table="finance" type="create" />
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

export default FinanceListPage;
