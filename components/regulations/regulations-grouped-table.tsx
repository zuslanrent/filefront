"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  File,
  Download,
  Eye,
  MoreHorizontal,
  Clock,
  Building2,
  ChevronDown,
  FolderOpen,
  Edit,
  Trash2,
  XCircle,
  Info,
} from "lucide-react";
import type { RegulationFile, Category } from "@/types/regulations";
import { currentUser } from "@/lib/mock-data/users";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RegulationsGroupedTableProps {
  regulations: RegulationFile[];
  categories: Category[];
  userDepartment: string;
  canManage: boolean;
  onEdit?: (regulation: RegulationFile) => void;
  onDelete?: (regulation: RegulationFile) => void;
  onDeactivate?: (regulation: RegulationFile) => void;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(fileType: string) {
  const type = fileType?.toLowerCase() || "";
  switch (type) {
    case "pdf":
    case "doc":
    case "docx":
      return <FileText className="size-4 text-red-500" />;
    case "xls":
    case "xlsx":
      return <FileSpreadsheet className="size-4 text-emerald-600" />;
    case "ppt":
    case "pptx":
      return <Presentation className="size-4 text-orange-500" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "image":
      return <Image className="size-4 text-blue-500" />;
    default:
      return <File className="size-4 text-slate-400" />;
  }
}

function getFileIconBg(fileType: string) {
  const type = fileType?.toLowerCase() || "";
  switch (type) {
    case "pdf":
    case "doc":
    case "docx":
      return "bg-red-50";
    case "xls":
    case "xlsx":
      return "bg-emerald-50";
    case "ppt":
    case "pptx":
      return "bg-orange-50";
    case "png":
    case "jpg":
    case "jpeg":
    case "image":
      return "bg-blue-50";
    default:
      return "bg-slate-50";
  }
}

async function postAuditLog(payload: {
  file_id: string;
  file_name: string;
  user_id: string;
  user_name: string;
  user_department: string;
  action: string;
  details?: string;
}) {
  try {
    await fetch(`${API_URL}/api/audit-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Audit log бичихэд алдаа:", err);
  }
}

export function RegulationsGroupedTable({
  regulations,
  categories,
  userDepartment,
  canManage,
  onEdit,
  onDelete,
  onDeactivate,
}: RegulationsGroupedTableProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(
    categories.map((c) => c.id),
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const groupedRegulations = useMemo(() => {
    const grouped: Record<string, RegulationFile[]> = {};
    categories.forEach((cat) => {
      grouped[cat.id] = regulations.filter((r) => r.category === cat.id);
    });
    const uncategorized = regulations.filter(
      (r) => !r.category || !categories.some((c) => c.id === r.category),
    );
    if (uncategorized.length > 0) grouped["uncategorized"] = uncategorized;
    return grouped;
  }, [regulations, categories]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const canDownload = (regulation: RegulationFile) => {
    if (regulation.downloadPermissions?.length > 0) {
      return (
        regulation.downloadPermissions.includes(userDepartment) ||
        userDepartment === "it"
      );
    }
    return regulation.department === userDepartment || userDepartment === "it";
  };

  const handleDownload = async (regulation: RegulationFile) => {
    if (!canDownload(regulation)) return;
    setDownloadingId(regulation.id);
    postAuditLog({
      file_id: regulation.id,
      file_name: regulation.name,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_department: currentUser.department,
      action: "download",
    });
    if (regulation.fileUrl) {
      try {
        const response = await fetch(regulation.fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = regulation.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error("Файл татахад алдаа:", error);
      }
    }
    setTimeout(() => setDownloadingId(null), 500);
  };

  if (regulations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <FileText className="size-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">
          Дүрэм журам олдсонгүй
        </h3>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          Хайлтын үр дүн олдсонгүй эсвэл танд харах эрх байхгүй байна
        </p>
      </div>
    );
  }

  const allCategories = [
    ...categories,
    ...(groupedRegulations["uncategorized"]?.length
      ? [
          {
            id: "uncategorized",
            name: "Бусад",
            description: "",
            order: 999,
            parentId: null,
            createdAt: "",
            updatedAt: "",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      {allCategories.map((category) => {
        const categoryRegulations = groupedRegulations[category.id] || [];
        if (categoryRegulations.length === 0) return null;
        const isOpen = openCategories.includes(category.id);

        return (
          <Collapsible
            key={category.id}
            open={isOpen}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Category header */}
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full px-5 py-3.5 bg-white hover:bg-slate-50 transition-colors text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FolderOpen className="size-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-slate-800">
                      {category.name}
                    </span>
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {categoryRegulations.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t border-slate-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pl-5 w-[32%]">
                          Файлын нэр
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Хэлтэс
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Батлагдсан
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Төлөв
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Хэмжээ
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right pr-5">
                          Үйлдэл
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryRegulations.map((regulation) => (
                        <TableRow
                          key={regulation.id}
                          className="hover:bg-slate-50/60 transition-colors border-slate-100"
                        >
                          {/* Файлын нэр */}
                          <TableCell className="pl-5 py-3.5">
                            <Link
                              href={`/regulations/${regulation.id}`}
                              className="flex items-center gap-3 group/link"
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileIconBg(regulation.fileType)}`}
                              >
                                {getFileIcon(regulation.fileType)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 truncate text-sm group-hover/link:text-blue-600 transition-colors">
                                  {regulation.name}
                                </p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">
                                  {regulation.fileName}
                                </p>
                              </div>
                            </Link>
                          </TableCell>

                          {/* Хэлтэс */}
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="size-3.5 text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 truncate max-w-[130px]">
                                {regulation.department || "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Батлагдсан огноо */}
                          <TableCell className="py-3.5">
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-3.5 text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600">
                                {regulation.approvedDate
                                  ? new Date(
                                      regulation.approvedDate,
                                    ).toLocaleDateString("mn-MN")
                                  : "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Төлөв */}
                          <TableCell className="py-3.5">
                            {regulation.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                Хүчинтэй
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                                Хүчингүй
                              </span>
                            )}
                          </TableCell>

                          {/* Хэмжээ */}
                          <TableCell className="py-3.5">
                            <span className="text-sm text-slate-500 font-mono">
                              {formatFileSize(regulation.fileSize)}
                            </span>
                          </TableCell>

                          {/* Үйлдэл */}
                          <TableCell className="py-3.5 pr-5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg"
                                >
                                  <MoreHorizontal className="size-4 text-slate-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48 rounded-xl shadow-lg border-slate-200"
                              >
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/regulations/${regulation.id}`}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye className="size-4 text-slate-500" />
                                    <span className="text-sm">Харах</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/regulations/${regulation.id}`}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <Info className="size-4 text-slate-500" />
                                    <span className="text-sm">Дэлгэрэнгүй</span>
                                  </Link>
                                </DropdownMenuItem>
                                {canDownload(regulation) &&
                                  regulation.fileUrl && (
                                    <DropdownMenuItem
                                      onClick={() => handleDownload(regulation)}
                                      disabled={downloadingId === regulation.id}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Download className="size-4 text-slate-500" />
                                      <span className="text-sm">
                                        {downloadingId === regulation.id
                                          ? "Татаж байна..."
                                          : "Татах"}
                                      </span>
                                    </DropdownMenuItem>
                                  )}
                                {canManage && (
                                  <>
                                    <DropdownMenuSeparator className="bg-slate-100" />
                                    <DropdownMenuItem
                                      onClick={() => onEdit?.(regulation)}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <Edit className="size-4 text-slate-500" />
                                      <span className="text-sm">Засах</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDeactivate?.(regulation)}
                                      className="flex items-center gap-2 cursor-pointer text-orange-600 focus:text-orange-600"
                                    >
                                      <XCircle className="size-4" />
                                      <span className="text-sm">
                                        Идэвхгүй болгох
                                      </span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => onDelete?.(regulation)}
                                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="size-4" />
                                      <span className="text-sm">Устгах</span>
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
