import React from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Files, 
  Calendar, 
  Search, 
  MessageSquare, 
  Settings as SettingsIcon,
  Plus,
  Scale,
  ChevronDown,
  LogOut,
  User as UserIcon
} from "lucide-react";
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Jurisdiction } from "@workspace/api-client-react/src/generated/api.schemas";

const navItems = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Matters", href: "/matters", icon: Briefcase },
  { name: "Contracts", href: "/contracts", icon: FileText },
  { name: "Documents", href: "/documents", icon: Files },
  { name: "Deadlines", href: "/deadlines", icon: Calendar },
  { name: "Research", href: "/research", icon: Search },
  { name: "Briefs", href: "/briefs", icon: MessageSquare },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetSettingsQueryKey(), data);
      }
    }
  });

  const handleJurisdictionChange = (jurisdiction: Jurisdiction) => {
    updateSettings.mutate({ data: { defaultJurisdiction: jurisdiction } });
  };

  const handleNewAction = (action: string) => {
    switch (action) {
      case 'matter':
        setLocation('/matters?new=true');
        break;
      case 'contract':
        setLocation('/contracts?new=true');
        break;
      case 'document':
        setLocation('/documents?new=true');
        break;
      case 'deadline':
        setLocation('/deadlines?new=true');
        break;
      case 'research':
        setLocation('/research?new=true');
        break;
      case 'brief':
        setLocation('/briefs?new=true');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-border md:h-screen md:sticky md:top-0 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-2 rounded-md">
            <Scale size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight">LexAI</h1>
            <p className="text-xs text-sidebar-foreground/60 font-medium tracking-wider uppercase">Workspace</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} className="block">
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <item.icon size={18} className={isActive ? "text-primary" : "text-sidebar-foreground/50"} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border mt-auto">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full bg-sidebar-accent" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24 bg-sidebar-accent" />
                <Skeleton className="h-3 w-16 bg-sidebar-accent" />
              </div>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-full flex items-center gap-3 hover:bg-sidebar-accent/40 rounded-md p-1 -m-1 transition-colors text-left"
                  data-testid="button-user-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (user?.firstName?.charAt(0) ||
                        user?.primaryEmailAddress?.emailAddress?.charAt(0) ||
                        settings?.attorneyName?.charAt(0) ||
                        settings?.firmName?.charAt(0) ||
                        "L").toUpperCase()
                    )}
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.fullName ||
                        user?.firstName ||
                        settings?.attorneyName ||
                        "Attorney"}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.primaryEmailAddress?.emailAddress ||
                        settings?.firmName ||
                        "Firm"}
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-sidebar-foreground/50 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium truncate">
                      {user?.fullName || user?.firstName || "Account"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.primaryEmailAddress?.emailAddress || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-settings">
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> Workspace settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ redirectUrl: `${import.meta.env.BASE_URL}` })}
                  data-testid="menu-signout"
                >
                  <LogOut className="mr-2 h-4 w-4 text-muted-foreground" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-medium text-muted-foreground hidden md:block">
              {navItems.find(i => location === i.href || (i.href !== "/" && location.startsWith(i.href)))?.name || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Jurisdiction Toggle */}
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : settings ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed text-xs font-medium uppercase tracking-wider">
                    {settings.defaultJurisdiction}
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuLabel>Jurisdiction</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleJurisdictionChange('us')} className="justify-between">
                    US {settings.defaultJurisdiction === 'us' && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleJurisdictionChange('uk')} className="justify-between">
                    UK {settings.defaultJurisdiction === 'uk' && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleJurisdictionChange('india')} className="justify-between">
                    India {settings.defaultJurisdiction === 'india' && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {/* Global New Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5 h-9 shadow-sm">
                  <Plus size={16} />
                  <span>New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNewAction('matter')}>
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" /> Matter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewAction('contract')}>
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Contract
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewAction('document')}>
                  <Files className="mr-2 h-4 w-4 text-muted-foreground" /> Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewAction('deadline')}>
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> Deadline
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNewAction('research')}>
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" /> Research Query
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewAction('brief')}>
                  <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" /> Client Brief
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
