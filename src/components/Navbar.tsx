"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "next-auth";

export default function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href={session ? "/companies" : "/"}
            className="flex items-center gap-2 group select-none"
          >
            <span className="text-2xl font-bold tracking-tight text-blue-600">
              HireIQ
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="hidden sm:flex items-center gap-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-1">Sign out</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="sm:hidden text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </Button>

                <Link href="/profile" className="cursor-pointer">
                  <Avatar className="h-9 w-9 border border-gray-300">
                    <AvatarImage
                      src={user?.image || undefined}
                      alt={user?.firstName || "User"}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {user?.firstName?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() || (
                          <UserIcon className="h-5 w-5" />
                        )}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <>
                <Button
                  variant="default"
                  asChild
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 transition cursor-pointer"
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
