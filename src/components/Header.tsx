import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { UserProfileButton } from "./UserProfile";

function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <SidebarTrigger className="h-6 w-6 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold truncate">{title}</h1>
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          </div>
        </div>
        <div className="shrink-0 ml-4">
          <UserProfileButton />
        </div>
      </div>
    </header>
  );
}

export default Header;
