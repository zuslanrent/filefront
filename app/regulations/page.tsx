"use client";

import { useState, useEffect, useMemo } from "react";
import { RegulationsHeader } from "@/components/regulations/regulations-header";
import { RegulationsFilters } from "@/components/regulations/regulations-filters";
import { RegulationsGroupedTable } from "@/components/regulations/regulations-grouped-table";
import { currentUser, canUserUpload } from "@/lib/mock-data/users";
import type {
  RegulationFile,
  FilterOptions,
  Category,
} from "@/types/regulations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

// ✅ Production болон Local орчинд Mixed Content болон хаяг олдохгүй унах алдаанаас сэргийлэх тохиргоо
const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "");

function authHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Backend-ийн regulation өгөгдлийг RegulationFile төрөлд хөрвүүлэх функц
function transformRegulation(item: any): RegulationFile {
  return {
    id: item.uuid || item.id,
    name: item.file_name || item.name,
    fileName: item.file_name || item.fileName,
    fileType: item.file_type || item.fileType || "pdf",
    fileUrl: item.file_url || item.fileUrl || null,
    fileSize: item.file_size || item.fileSize || 0,
    category: item.group_name || item.category || null,
    department: item.division_name || item.department || null,
    status: item.status || "active",
    approvedDate: item.approved_date || item.approvedDate || null,
    downloadPermissions:
      item.download_permissions || item.downloadPermissions || [],
    uploadedBy: item.uploaded_by || item.uploadedBy || "",
    uploadedAt: item.uploaded_at || item.uploadedAt || new Date().toISOString(),
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
    description: item.description || "",
    viewPermissions: item.view_permissions || item.viewPermissions || [],
    version: item.version || 1,
    previousVersions: item.previous_versions || item.previousVersions || [],
  };
}

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<RegulationFile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    department: "all",
    category: "all",
    status: "all",
    sortBy: "newest",
  });

  const [deactivateDialog, setDeactivateDialog] = useState<{
    open: boolean;
    regulation: RegulationFile | null;
  }>({ open: false, regulation: null });
  const [deactivateReason, setDeactivateReason] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    regulation: RegulationFile | null;
  }>({ open: false, regulation: null });
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const canManage = canUserUpload(currentUser);

  // API-аас regulations татах
  const fetchRegulations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/regulations`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        const transformed = data.data.map(transformRegulation);
        setRegulations(transformed);
      } else {
        setError(data.message || "Дүрэм журам татахад алдаа гарлаа");
      }
    } catch (err) {
      console.error("Regulations fetch error:", err);
      setError("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        const mapped: Category[] = data.data.map((g: any) => ({
          id: g.group_name,
          name: g.group_name,
          description: g.description || "",
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error("Бүлэг татахад алдаа:", err);
    }
  };

  // Regulation-ийг идэвхгүй болгох
  const deactivateRegulation = async (
    regulation: RegulationFile,
    reason: string,
  ) => {
    try {
      const res = await fetch(`${API_URL}/api/regulations/${regulation.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          file_name: regulation.fileName,
          group_name: regulation.category,
          division_name: regulation.department,
          approved_date: regulation.approvedDate,
          file_size: regulation.fileSize,
          status: "inactive",
          decline_date: new Date().toISOString().split("T")[0],
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Audit log үүсгэх
        fetch(`${API_URL}/api/audit-logs`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            file_id: regulation.id,
            file_name: regulation.name,
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_department: currentUser.department,
            action: "inactivate",
            details: reason,
          }),
        }).catch(() => {});
        
        await fetchRegulations();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Deactivate error:", err);
      return false;
    }
  };

  // Regulation устгах
  const deleteRegulation = async (regulation: RegulationFile) => {
    try {
      const res = await fetch(`${API_URL}/api/regulations/${regulation.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        // Audit log үүсгэх
        fetch(`${API_URL}/api/audit-logs`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            file_id: regulation.id,
            file_name: regulation.name,
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_department: currentUser.department,
            action: "delete",
            details: "Устгагдлаа",
          }),
        }).catch(() => {});
        
        await fetchRegulations();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Delete error:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchRegulations();
    fetchCategories();
  }, []);

  const filteredRegulations = useMemo(() => {
    let result = [...regulations];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.fileName.toLowerCase().includes(s) ||
          (r as any).description?.toLowerCase().includes(s),
      );
    }

    if (filters.department !== "all") {
      result = result.filter(
        (r) => String(r.department) === String(filters.department),
      );
    }

    if (filters.category !== "all") {
      result = result.filter((r) => r.category === filters.category);
    }

    if (filters.status !== "all") {
      result = result.filter((r) => r.status === filters.status);
    }

    if (filters.dateFrom) {
      result = result.filter(
        (r) => r.approvedDate && new Date(r.approvedDate) >= filters.dateFrom!,
      );
    }
    if (filters.dateTo) {
      result = result.filter(
        (r) => r.approvedDate && new Date(r.approvedDate) <= filters.dateTo!,
      );
    }

    switch (filters.sortBy) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "mn"));
        break;
      case "updated":
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        break;
    }

    return result;
  }, [regulations, filters]);

  const activeCount = regulations.filter((r) => r.status === "active").length;

  const handleDeactivate = (regulation: RegulationFile) => {
    setDeactivateDialog({ open: true, regulation });
    setDeactivateReason("");
  };

  const confirmDeactivate = async () => {
    if (!deactivateDialog.regulation || !deactivateReason) return;
    const success = await deactivateRegulation(
      deactivateDialog.regulation,
      deactivateReason,
    );
    if (success) {
      setDeactivateDialog({ open: false, regulation: null });
      setDeactivateReason("");
    } else {
      alert("Хүчингүй болгоход алдаа гарлаа");
    }
  };

  const handleDelete = (regulation: RegulationFile) =>
    setDeleteDialog({ open: true, regulation });

  const confirmDelete = async () => {
    if (!deleteDialog.regulation) return;
    const success = await deleteRegulation(deleteDialog.regulation);
    if (success) {
      setDeleteDialog({ open: false, regulation: null });
    } else {
      alert("Устгахад алдаа гарлаа");
    }
  };

  const handleEdit = (regulation: RegulationFile) => {
    window.location.href = `/regulations/${regulation.id}/edit`;
  };

  // Шинэ бүлэг API-д хадгалах
  const handleAddCategory = async () => {
    if (!newCategoryName) return;
    setCategoryLoading(true);
    setCategoryError("");
    try {
      const res = await fetch(`${API_URL}/api/groups`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          group_name: newCategoryName,
          description: newCategoryDesc || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        setNewCategoryDialog(false);
        setNewCategoryName("");
        setNewCategoryDesc("");
      } else {
        setCategoryError(data.message || "Алдаа гарлаа.");
      }
    } catch {
      setCategoryError("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setCategoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Дүрэм журам ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchRegulations}>Дахин оролдох</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="space-y-6">
          <RegulationsHeader
            totalCount={regulations.length}
            activeCount={activeCount}
            canUpload={canManage}
          />
          <RegulationsFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
          />
          {canManage && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewCategoryDialog(true)}
              >
                <Plus className="size-4 mr-2" />
                Шинэ бүлэг нэмэх
              </Button>
            </div>
          )}
          <RegulationsGroupedTable
            regulations={filteredRegulations}
            categories={categories}
            userDepartment={currentUser.department}
            canManage={canManage}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeactivate={handleDeactivate}
          />
        </div>
      </div>

      {/* Deactivate Dialog */}
      <Dialog
        open={deactivateDialog.open}
        onOpenChange={(open) =>
          !open && setDeactivateDialog({ open: false, regulation: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Хүчингүй болгох</DialogTitle>
            <DialogDescription>
              {deactivateDialog.regulation?.name} журмыг хүчингүй болгохдоо
              итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Шалтгаан *</Label>
            <Textarea
              id="reason"
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              placeholder="Хүчингүй болгосон шалтгааныг бичнэ үү..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDeactivateDialog({ open: false, regulation: null })
              }
            >
              Цуцлах
            </Button>
            <Button
              onClick={confirmDeactivate}
              disabled={!deactivateReason}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Хүчингүй болгох
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, regulation: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Устгах</DialogTitle>
            <DialogDescription>
              {deleteDialog.regulation?.name} журмыг устгахдаа итгэлтэй байна
              уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, regulation: null })}
            >
              Цуцлах
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Устгах
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Шинэ бүлэг үүсгэх</DialogTitle>
            <DialogDescription>
              Дүрэм журмын шинэ бүлэг (ангилал) үүсгэх
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {categoryError && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
                {categoryError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="catName">Бүлгийн нэр *</Label>
              <Input
                id="catName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Жишээ: Гэрээ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catDesc">Тайлбар</Label>
              <Input
                id="catDesc"
                value={newCategoryDesc}
                onChange={(e) => setNewCategoryDesc(e.target.value)}
                placeholder="Бүлгийн товч тайлбар"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewCategoryDialog(false);
                setCategoryError("");
              }}
            >
              Цуцлах
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategoryName || categoryLoading}
            >
              {categoryLoading ? "Хадгалж байна..." : "Үүсгэх"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}