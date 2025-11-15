"use client";

import { SectionTitle } from "@/components";
import { Loader } from "@/components/Loader";
import { ProfileModule } from "@/components/modules/profile";
import { Suspense } from "react";
import { useSession } from "next-auth/react";
const ProfilePage = () => {
  const { data: session }: any = useSession();
  return (
    <div className="bg-white">
      <SectionTitle title="Profile Page" path="Home | Profile" />
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Profile Page
          </h1>
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {session?.user ? "Signed in as" : "Please Login First..."}
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100">
                  {session?.user?.email ? session.user.email : ""}
                </p>
              </div>
              {session?.user?.role && (
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {session.user.role || ""}
                </span>
              )}
            </div>
          </div>
          {session?.user && (
          <Suspense fallback={<Loader />}>
            <ProfileModule />
          </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
