"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
  Menu,
  X,
  Headphones,
  UserSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  children: NavItem[];
}

const navigation: NavGroup[] = [
  {
    label: "Self Service",
    icon: <UserSearch className="size-4" />,
    children: [
      {
        label: "Дүрэм журам",
        href: "/regulations",
        icon: <FileText className="size-4" />,
      },
      {
        label: "IT support",
        href: "/itsupport",
        icon: <Headphones className="size-4" />,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(
    navigation.map((n) => n.label),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Building2 className="size-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-slate-800 text-sm">Байгууллага</p>
          <p className="text-xs text-slate-400">Дотоод систем</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((group) => {
          const isOpen = openGroups.includes(group.label);

          return (
            <div key={group.label}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {group.icon}
                  {group.label}
                </div>
                {isOpen ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </button>

              {/* Group children */}
              {isOpen && (
                <div className="mt-1 space-y-0.5">
                  {group.children.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800",
                        )}
                      >
                        <span
                          className={cn(
                            isActive ? "text-blue-600" : "text-slate-400",
                          )}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-200">
        <p className="text-xs text-slate-400">© 2026 Байгууллага</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200"
      >
        <Menu className="size-5 text-slate-600" />
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg"
            >
              <X className="size-4 text-slate-500" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
