import FormModal from "@/components/FormModal";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { ITEM_PER_PAGE } from "@/lib/settings"
import { auth } from "@clerk/nextjs/server";

export const dynamic = 'force-dynamic';

type AnnouncementList = Announcement & { class?: Class | null };

const AnnouncementListPage = async ({ searchParams }: { searchParams: any }) => {
  // Get auth info
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Await searchParams
  const params = await searchParams;
  const { page, ...queryParams } = params ?? {};
  const p = page ? parseInt(page as string) : 1;

  // Build query
  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== '') {
        switch (key) {
          case "search":
            query.OR = [
              { title: { contains: value as string, mode: "insensitive" } },
              { description: { contains: value as string, mode: "insensitive" } },
            ];
            break;
          case "classId":
            query.classId = parseInt(value as string);
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  const roleConditions = {
    teacher: { lessons: { some: { teachers: { some: { id: currentUserId! } } } } },
    student: { students: { some: { id: currentUserId! } } },
    parent: { students: { some: { parentId: currentUserId! } } },
  };

  if (role !== "admin") {
    query.OR = [
      { classId: null },
      {
        class: roleConditions[role as keyof typeof roleConditions] || {},
      },
    ];
  }
  
  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: { class: true },
      take: ITEM_PER_PAGE,
      skip: (p - 1) * ITEM_PER_PAGE,
      orderBy: { id: 'asc' },
    }),
    prisma.announcement.count({ where: query }),
  ]);

  // Define columns inside component so we can access role
  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
        ? [
            {
              header: "Actions",
              accessor: "action",
            },
          ]
        : []),
      ];
      
      const renderRow = (item: AnnouncementList) => (
        <tr
          key={item.id}
          className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-ZekPurpleLight"
        >
          <td className="flex items-center gap-4 p-4">{item.title}</td>
          <td className="p-4 max-w-xs truncate">{item.description}</td>
      
          <td>{item.class?.name || '-'}</td>
          <td className="hidden md:table-cell">
            {new Date(item.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            })}
          </td>
          <td>
            <div className="flex items-center gap-2">
              {role === "admin" && (
                <>
                  <FormContainer table="announcement" type="update" data={item} />
                  <FormModal table="announcement" type="delete" id={item.id} />
                </>
              )}
            </div>
          </td>
        </tr>
      );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Announcements</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button> */}
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button> */}
            {role === "admin" && (
              <FormContainer table="announcement" type="create" />
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
};

export default AnnouncementListPage;