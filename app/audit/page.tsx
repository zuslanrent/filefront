"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, Building2, Search } from "lucide-react";
import { format } from "date-fns";
import { mn } from "date-fns/locale";
import Link from "next/link";

// ✅ Орчны хувьсагч олдохгүй үед хөтөчийн хаягаас fallback авах тохиргоо
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");
const DEPT_URL =
  "http://intranet.bodigroup.mn/intranet/api/departments?api_key=int_api_7f766e223f04c1638db65580fcb356be2aeb3e79";

interface AuditLog {
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

interface Department {
  id: string | number;
  name: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  upload: { label: "Оруулсан", color: "bg-blue-100 text-blue-700" },
  view: { label: "Үзсэн", color: "bg-gray-100 text-gray-600" },
  download: { label: "Татсан", color: "bg-green-100 text-green-700" },
  update: { label: "Зассан", color: "bg-yellow-100 text-yellow-700" },
  inactivate: {
    label: "Хүчингүй болгосон",
    color: "bg-orange-100 text-orange-700",
  },
  delete: { label: "Устгасан", color: "bg-red-100 text-red-700" },
};

// ✅ Аутентификацийн толгой мэдээлэл бэлдэх функц
function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [action, setAction] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (department !== "all") params.append("department", department);
      if (action !== "all") params.append("action", action);

      const res = await fetch(`${API_URL}/api/audit-logs?${params}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) setLogs(data.data);
    } catch (err) {
      console.error("Audit log татахад алдаа:", err);
    } finally {
      // ← Энд "finally" гэдгээ зөв хааж бичих
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Хэлтсийн жагсаалт татах
    fetch(DEPT_URL)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setDepartments(list);
      })
      .catch((err) => console.error("Хэлтэс татахад алдаа:", err));
  }, []);

  // Шүүлтүүр өөрчлөгдөх бүрд автоматаар дахин татах
  useEffect(() => {
    fetchLogs();
  }, [department, action]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/regulations">
              <ArrowLeft className="size-4 mr-2" />
              Жагсаалт руу буцах
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100">
              <Clock className="size-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Audit Log</h1>
              <p className="text-sm text-muted-foreground">
                Хэн, хэзээ, ямар файл үзсэн/татсан/зассан түүх
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-xl p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Файл эсвэл хэрэглэгчээр хайж Enter дарна уу..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                className="pl-9"
              />
            </div>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Building2 className="size-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Бүх хэлтэс" />
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
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Бүх үйлдэл" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Бүх үйлдэл</SelectItem>
                <SelectItem value="upload">Оруулсан</SelectItem>
                <SelectItem value="view">Үзсэн</SelectItem>
                <SelectItem value="download">Татсан</SelectItem>
                <SelectItem value="update">Зассан</SelectItem>
                <SelectItem value="inactivate">Хүчингүй болгосон</SelectItem>
                <SelectItem value="delete">Устгасан</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchLogs} variant="secondary">
              Хайх
            </Button>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
            <p>
              Нийт <b>{logs.length}</b> илэрц олдлоо
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[180px]">
                    Огноо/Цаг
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[180px]">
                    Хэрэглэгч
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[150px]">
                    Хэлтэс
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[150px]">
                    Үйлдэл
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Файл
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Тайлбар
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        Уншиж байна...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Бүртгэл байхгүй байна.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const actionInfo = ACTION_LABELS[log.action] || {
                      label: log.action,
                      color: "bg-gray-100 text-gray-600",
                    };

                    // Огноо хөрвүүлэх хамгаалалт
                    let formattedDate = "—";
                    try {
                      if (log.created_at) {
                        formattedDate = format(
                          new Date(log.created_at),
                          "yyyy-MM-dd HH:mm",
                          { locale: mn },
                        );
                      }
                    } catch (e) {
                      console.error("Date error:", e);
                    }

                    return (
                      <tr
                        key={log.uuid || log.created_at}
                        className="border-b hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {formattedDate}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {log.user_name?.charAt(0) || "U"}
                            </div>
                            <span className="font-medium truncate max-w-[150px]">
                              {log.user_name || "Тодорхойгүй"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted-foreground uppercase text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded">
                            {log.user_department || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}
                          >
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-blue-600 font-medium break-all">
                            {log.file_name || "—"}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 text-muted-foreground max-w-[250px] truncate"
                          title={log.details}
                        >
                          {log.details || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
