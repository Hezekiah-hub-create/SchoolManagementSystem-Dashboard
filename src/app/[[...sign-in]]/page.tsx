"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;

    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-ZekPurple to-ZekSky">
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="bg-ZekPurpleLight p-16 rounded-lg shadow-2xl flex flex-col gap-4 max-w-md w-full"
        >
          <div className="flex flex-col items-center gap-4">
            <Image
              src="https://res.cloudinary.com/doatmmlrr/image/upload/v1762434303/ChatGPT_Image_Nov_6_2025_01_00_01_PM_va2yle.png"
              alt="SchMngSys Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
            <h1 className="text-2xl font-bold text-ZekSky">SchMngSys</h1>
          </div>
          <h2 className="text-center text-gray-600">Welcome back! Please sign in to access your account.</h2>
          <Clerk.GlobalError className="text-sm text-red-400 text-center" />
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm font-medium text-gray-700">
              Username
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-ZekSky focus:border-transparent transition-colors"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm font-medium text-gray-700">
              Password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-ZekSky focus:border-transparent transition-colors"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <SignIn.Action
            submit
            className="bg-ZekSky text-white py-3 px-6 rounded-md text-sm font-medium hover:bg-ZekSkyLight transition-colors mt-4"
          >
            Sign In
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  )
}

export default LoginPage