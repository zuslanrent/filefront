"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditLogTable } from "@/components/regulations/audit-log-table";
import type { AuditLog } from "@/types/regulations";
import {
  ArrowLeft,
  Search,
  History,
  X,
  SlidersHorizontal,
  User,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Vercel болон Local орчинд Mixed Content алдаа гаргахгүй аюулгүй тохиргоо
const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
const DEPT_URL = `${API_URL}/api/departments/external`;

type ActionFilter = "all" | AuditLog["action"];

interface Filters {
  search: string;
  department: string;
  action: ActionFilter;
  users: string[];
}

interface Department {
  id: string | number;
  name: string;
}

interface ApiAuditLog {
  uuid: string;
  file_id: string;
  file_name: string;
  user_id: string;
  user_name: string;
  user_department: string;
  action: string;
  details: string;
  created_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    department: "all",
    action: "all",
    users: [],
  });
  const [userSelectOpen, setUserSelectOpen] = useState(false);

  // Unique users from logs
  const allUsers = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string }>();
    logs.forEach((log) => {
      if (!map.has(log.userId)) {
        map.set(log.userId, { id: log.userId, name: log.userName, email: "" });
      }
    });
    return Array.from(map.values());
  }, [logs]);

  // API-аас audit logs татах
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.department !== "all")
        params.append("department", filters.department);
      if (filters.action !== "all") params.append("action", filters.action);

      const res = await fetch(`${API_URL}/api/audit-logs?${params}`);
      const data = await res.json();

      if (data.success) {
        const mapped: AuditLog[] = data.data.map((log: ApiAuditLog) => ({
          id: log.uuid,
          fileId: log.file_id,
          fileName: log.file_name,
          userId: log.user_id,
          userName: log.user_name,
          userDepartment: log.user_department,
          action: log.action as AuditLog["action"],
          details: log.details,
          timestamp: new Date(log.created_at),
        }));
        setLogs(mapped);
      }
    } catch (err) {
      console.error("Audit log татахад алдаа:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Departments татах
    fetch(DEPT_URL)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setDepartments(list);
      })
      .catch((err) => console.error("Хэлтэс татахад алдаа:", err));

    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filters.department, filters.action]);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.fileName.toLowerCase().includes(s) ||
          log.userName.toLowerCase().includes(s),
      );
    }

    if (filters.users.length > 0) {
      result = result.filter((log) => filters.users.includes(log.userId));
    }

    result.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return result;
  }, [logs, filters]);

  const clearFilters = () => {
    setFilters({ search: "", department: "all", action: "all", users: [] });
  };

  const toggleUser = (userId: string) => {
    setFilters((prev) => ({
      ...prev,
      users: prev.users.includes(userId)
        ? prev.users.filter((u) => u !== userId)
        : [...prev.users, userId],
    }));
  };

  const hasActiveFilters =
    filters.search !== "" ||
    filters.department !== "all" ||
    filters.action !== "all" ||
    filters.users.length > 0;

  const actionOptions: { value: ActionFilter; label: string }[] = [
    { value: "all", label: "Бүх үйлдэл" },
    { value: "view", label: "Үзсэн" },
    { value: "download", label: "Татсан" },
    { value: "upload", label: "Оруулсан" },
    { value: "edit", label: "Засварласан" },
    { value: "delete", label: "Устгасан" },
    { value: "inactivate", label: "Хүчингүй болгосон" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/regulations">
              <ArrowLeft className="size-4 mr-2" />
              Жагсаалт руу буцах
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100">
            <History className="size-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Audit Log
            </h1>
            <p className="text-sm text-muted-foreground">
              Хэн, хэзээ, ямар файл үзсэн/татсан/зассан
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Түүх шүүлтүүр</CardTitle>
            <CardDescription>
              Ажилтнуудын жагсаалтаас сонгож аудит лог харах
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Файл эсвэл хэрэглэгчээр хайх..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                  className="pl-9"
                />
              </div>

              {/* User selector */}
              <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[200px] justify-start"
                  >
                    <User className="size-4 mr-2" />
                    {filters.users.length > 0
                      ? `${filters.users.length} ажилтан сонгосон`
                      : "Ажилтан сонгох"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-72" align="start">
                  <Command>
                    <CommandInput placeholder="Ажилтан хайх..." />
                    <CommandList>
                      <CommandEmpty>Олдсонгүй</CommandEmpty>
                      <CommandGroup>
                        {allUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={user.name}
                            onSelect={() => toggleUser(user.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 size-4",
                                filters.users.includes(user.id)
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <p className="font-medium">{user.name}</p>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Department filter */}
              <Select
                value={filters.department}
                onValueChange={(value) =>
                  setFilters({ ...filters, department: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Хэлтэс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх хэлтэс</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Action filter */}
              <Select
                value={filters.action}
                onValueChange={(value) =>
                  setFilters({ ...filters, action: value as ActionFilter })
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SlidersHorizontal className="size-4 mr-2" />
                  <SelectValue placeholder="Үйлдэл" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="size-4 mr-1" />
                  Цэвэрлэх
                </Button>
              )}
            </div>

            {/* Selected user badges */}
            {filters.users.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.users.map((userId) => {
                  const user = allUsers.find((u) => u.id === userId);
                  if (!user) return null;
                  return (
                    <Badge key={userId} variant="secondary" className="gap-1">
                      {user.name}
                      <button
                        onClick={() => toggleUser(userId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Нийт {filteredLogs.length} бүртгэл
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Уншиж байна...
              </div>
            ) : (
              <AuditLogTable logs={filteredLogs} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}