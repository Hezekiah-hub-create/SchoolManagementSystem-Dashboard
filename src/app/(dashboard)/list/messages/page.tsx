import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

type MessageList = {
  id: string;
  senderId: string;
  senderType: string;
  receiverId: string;
  receiverType: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
};

const columns = [
  {
    header: "From",
    accessor: "sender",
  },
  {
    header: "To",
    accessor: "receiver",
    className: "hidden md:table-cell",
  },
  {
    header: "Subject",
    accessor: "subject",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden lg:table-cell",
  },
  {
    header: "Status",
    accessor: "status",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const renderRow = (item: MessageList) => (
  <tr
    key={item.id}
    className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ZekPurpleLight"
  >
    <td className="p-4">
      <div className="flex flex-col">
        <span className="font-medium">{item.senderId.substring(0, 8)}...</span>
        <span className="text-xs text-gray-500">{item.senderType}</span>
      </div>
    </td>
    <td className="hidden md:table-cell">
      <div className="flex flex-col">
        <span className="text-sm">{item.receiverId.substring(0, 8)}...</span>
        <span className="text-xs text-gray-500">{item.receiverType}</span>
      </div>
    </td>
    <td className="p-4">
      <span className={item.isRead ? "font-normal" : "font-semibold"}>
        {item.subject}
      </span>
    </td>
    <td className="hidden lg:table-cell">
      {format(new Date(item.createdAt), "MMM d, yyyy")}
    </td>
    <td className="hidden lg:table-cell">
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          item.isRead
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {item.isRead ? "Read" : "Unread"}
      </span>
    </td>
    <td>
      <div className="flex items-center gap-2">
        <FormModal table="message" type="view" data={item} />
      </div>
    </td>
  </tr>
);

const MessagesPage = async ({ searchParams }: { searchParams: any }) => {
  const resolvedSearchParams = await searchParams;
  const { page, ...queryParams } = resolvedSearchParams ?? {};
  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    return <div className="p-4">Please log in to view messages</div>;
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
              { content: { contains: value as string, mode: "insensitive" } },
            ];
            break;
          case "read":
            query.isRead = value === "true";
            break;
          default:
            break;
        }
      }
    }
  }

  // Get messages where user is sender or receiver
  query.OR = [
    { senderId: userId },
    { receiverId: userId },
  ];

  try {
    const [data, count] = await prisma.$transaction([
      prisma.message.findMany({
        where: query,
        take: 10,
        skip: (p - 1) * 10,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.message.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">Messages</h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <FormContainer table="message" type="create" />
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
    console.error("Error fetching messages:", error);
    return <div className="p-4">Error loading messages</div>;
  }
};

export default MessagesPage;
