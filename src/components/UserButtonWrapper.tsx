'use client';

import dynamic from 'next/dynamic';

const UserButton = dynamic(() => import("@clerk/nextjs").then(mod => mod.UserButton), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
});

export default function UserButtonWrapper() {
  return <UserButton />;
}
