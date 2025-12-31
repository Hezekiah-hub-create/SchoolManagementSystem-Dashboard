"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import UserButtonWrapper from "./UserButtonWrapper";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user } = useUser();
  const [announcementCount, setAnnouncementCount] = useState(0);

  useEffect(() => {
    const fetchAnnouncementCount = async () => {
      try {
        const response = await fetch("/api/announcements/count");
        const data = await response.json();
        setAnnouncementCount(data.count);
      } catch (error) {
        console.error("Failed to fetch announcement count:", error);
      }
    };

    fetchAnnouncementCount();
  }, []);
  return (
    <div className="flex items-center justify-between p-4">
      {/* SEARCH BAR */}
      {/* <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2">
        <Image src="/search.png" alt="" width={14} height={14} />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none"
        />
      </div> */}
      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <Link href="/list/messages">
          {/* <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer">
            <Image src="/message.png" alt="" width={20} height={20} />
          </div> */}
        </Link>
        <Link href="/list/announcements" onClick={() => setAnnouncementCount(0)}>
          <div className="bg-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative">
            <Image src="/announcement.png" alt="" width={20} height={20} />
            {announcementCount > 0 && (
              <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs">
                {announcementCount}
              </div>
            )}
          </div>
        </Link>
        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium">{user?.firstName} {user?.lastName}</span>
          <span className="text-[10px] text-gray-500 text-right">
            {user?.publicMetadata?.role as string}
          </span>
        </div>
        {/* <Image src="/avatar.png" alt="" width={36} height={36} className="rounded-full"/> */}
        <UserButtonWrapper />
      </div>
    </div>
  );
};

export default Navbar;
