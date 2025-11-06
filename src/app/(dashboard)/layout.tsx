import React from "react";
import Link from "next/link";
import Image from "next/image";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="h-screen flex">
        {/* LEFT */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] p-4">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="https://res.cloudinary.com/doatmmlrr/image/upload/v1762434303/ChatGPT_Image_Nov_6_2025_01_00_01_PM_va2yle.png" alt="logo" width={100} height={100} unoptimized  />
          <span className="hidden lg:block font-bold">SchMngSys</span>
        </Link>
        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#EFF2F8] overflow-scroll flex flex-col">
        <Navbar />
        {children}
      </div>
      </div>
  );
}