import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/authStore";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";

import {
  LogOut,
  LayoutGrid,
  BarChart3,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";

const NAV = [
  {
    href: "/cases",
    label: "Dashboard Grid",
    icon: LayoutGrid,
  },
  {
    href: "/analytics",
    label: "Analytics Dashboard",
    icon: BarChart3,
  },
];

export function TopBar() {
  const { user, signOut } = useAuthStore();
  const { pathname } = useLocation();

  const initials =
    user?.fullName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const handleLogout = async () => {
    try {
      await signOut();
      // The signOut function will handle clearing state and redirecting
      // through the AuthGuard
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50 bg-white">
      <div className="h-16 px-6 flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-fit">
          {/* Logo */}
          <div className="h-10 w-10 overflow-hidden rounded-xl border bg-white shadow-sm flex items-center justify-center">
            <img
              src="src/assets/logo.jpg"
              alt="EMS Logo"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Title */}
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold leading-none">
              ESM Issue & Voucher Tracker
            </h1>

            <p className="text-xs text-muted-foreground mt-1">
              Enterprise support and UAT milestone workflow engine
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* NAV */}
          <NotificationCenter />
          <nav className="flex items-center gap-2 bg-muted p-1 rounded-xl">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);

              return (
                <Link key={href} to={href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "rounded-lg gap-2 px-4 text-xs font-medium h-9",
                      active &&
                        "bg-background shadow-sm border text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {label}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">
                  {user?.fullName || user?.userName || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || user?.userName || "No email"}
                </p>
                {user?.branch && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Branch: {user.branch}
                  </p>
                )}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive gap-2 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}