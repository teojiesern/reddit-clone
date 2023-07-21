"use client";

import { User } from "next-auth";
import UserAvatar from "./UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/DropdownMenu";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserAccountNavProps {
    // because we are using the google provider, there will be four properties returned in the user object and we use this pick utility type to only get the name, image, and email properties, excluding the id property, this is similar to using the omit utility type on id. this means that the user would be of a type object that has the name, image, and email properties
    user: Pick<User, "name" | "image" | "email">;
}

export default function UserAccountNav({ user }: UserAccountNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar user={user} className="h-8 w-8" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white ">
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                        {user.name && (
                            <p className="font-medium">{user.name}</p>
                        )}
                        {user.email && (
                            <p className="w-[200px] truncate text-sm text-zinc-700">
                                {user.email}
                            </p>
                        )}
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/" className="cursor-pointer">
                        Feed
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/r/create">Create Community</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(e) => {
                        e.preventDefault();
                        signOut({
                            callbackUrl: `${window.location.origin}/sign-in`,
                        });
                    }}
                >
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
