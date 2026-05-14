"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VersionHistory } from "@/components/regulations/version-history";
import { currentUser, canUserUpload } from "@/lib/mock-data/users";
import type { RegulationFile } from "@/types/regulations";
import { format } from "date-fns";
import { mn } from "date-fns/locale";
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  File,
  Building2,
  Calendar,
  User,
  Clock,
  Eye,
  Shield,
  History,
  AlertTriangle,
  Ban,
  Loader2,
} from "lucide-react";
import { AuditLogSection } from "@/components/regulations/audit-log-section";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const DEPT_URL =
  "http://intranet.bodigroup.mn/intranet/api/departments?api_key=int_api_7f766e223f04c1638db65580fcb356be2aeb3e79";

interface Department {
  id: string | number;
  name: string;
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
      return <FileText className="size-12 text-red-500" />;
    case "xls":
    case "xlsx":
      return <FileSpreadsheet className="size-12 text-green-600" />;
    case "ppt":
    case "pptx":
      return <Presentation className="size-12 text-orange-500" />;
    case "png":
    case "jpg":
    case "jpeg":
      return <Image className="size-12 text-purple-500" />;
    default:
      return <File className="size-12 text-muted-foreground" />;
  }
}

export default function RegulationDetailPage() {
  const params = useParams();
  const [regulation, setRegulation] = useState<RegulationFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [inactivateReason, setInactivateReason] = useState("");
  const [isInactivating, setIsInactivating] = useState(false);
  const [showInactivateDialog, setShowInactivateDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const canEdit = canUserUpload(currentUser);

  // ID-г монгол нэрээр орлуулах
  const getDeptName = (deptId: string | null): string => {
    if (!deptId) return "—";
    const found = departments.find((d) => String(d.id) === String(deptId));
    return found ? found.name : deptId;
  };

  // Бүлгийн нэр — UUID-г group_name-аар орлуулах
  const getCategoryName = (cat: string | null): string => {
    if (!cat) return "—";
    return cat;
  };

  // Departments татах
  useEffect(() => {
    fetch(DEPT_URL)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setDepartments(list);
      })
      .catch((err) => console.error("Хэлтэс татахад алдаа:", err));
  }, []);

  const hasSentViewLog = useRef(false);

  const fetchRegulation = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/regulations/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        const item = data.data;
        const transformed: RegulationFile = {
          id: item.uuid,
          name: item.file_name,
          fileName: item.file_name,
          fileType: item.file_type || "file",
          fileUrl: item.file_url || null,
          fileSize: parseInt(item.file_size) || 0,
          category: item.group_name,
          department: item.division_name,
          status: item.status || "active",
          approvedDate: item.approved_date,
          downloadPermissions: item.download_permissions || [],
          viewPermissions: item.view_permissions || [],
          uploadedBy: item.uploaded_by_name || item.uploaded_by || "",
          uploadedAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
          description: item.description || "",
          version: 1,
          previousVersions: [],
        };
        setRegulation(transformed);

        // Зөвхөн нэг удаа log бичнэ
        if (!hasSentViewLog.current) {
          hasSentViewLog.current = true;
          fetch(`${API_URL}/api/audit-logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file_id: transformed.id,
              file_name: transformed.name,
              user_id: currentUser.id,
              user_name: currentUser.name,
              user_department: currentUser.department,
              action: "view",
            }),
          }).catch(() => {});
        }
      } else {
        setError(data.message || "Файл олдсонгүй");
      }
    } catch (err) {
      setError("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = params.id as string;
    if (id) fetchRegulation(id);
  }, [params.id]);

  const handleDownload = async () => {
    if (!regulation?.fileUrl) return;
    setIsDownloading(true);
    try {
      fetch(`${API_URL}/api/audit-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: regulation.id,
          file_name: regulation.name,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_department: currentUser.department,
          action: "download",
        }),
      }).catch(() => {});

      const a = document.createElement("a");
      a.href = regulation.fileUrl;
      a.download = regulation.fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert("Файл татахад алдаа гарлаа");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInactivate = async () => {
    if (!regulation || !inactivateReason) return;
    setIsInactivating(true);
    try {
      const res = await fetch(`${API_URL}/api/regulations/${regulation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: regulation.fileName,
          group_name: regulation.category,
          division_name: regulation.department,
          approved_date: regulation.approvedDate,
          status: "inactive",
          decline_date: new Date().toISOString().split("T")[0],
          file_size: regulation.fileSize,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetch(`${API_URL}/api/audit-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_id: regulation.id,
            file_name: regulation.name,
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_department: currentUser.department,
            action: "inactivate",
            details: inactivateReason,
          }),
        }).catch(() => {});
        await fetchRegulation(regulation.id);
        setShowInactivateDialog(false);
        setInactivateReason("");
      } else {
        alert(data.message || "Хүчингүй болгоход алдаа гарлаа");
      }
    } catch {
      alert("Сервертэй холбогдоход алдаа гарлаа");
    } finally {
      setIsInactivating(false);
    }
  };

  const canDownload =
    regulation?.downloadPermissions?.includes(currentUser.department) ||
    currentUser.department === "it";
  const isPdf = regulation?.fileType?.toLowerCase() === "pdf";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !regulation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-16 px-4 max-w-md text-center">
          <FileText className="size-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-semibold mb-2">Файл олдсонгүй</h1>
          <p className="text-muted-foreground mb-6">
            {error || "Хайсан файл байхгүй эсвэл танд харах эрх байхгүй байна"}
          </p>
          <Button asChild>
            <Link href="/regulations">Буцах</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/regulations">
              <ArrowLeft className="size-4 mr-2" />
              Жагсаалт руу буцах
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            {getFileIcon(regulation.fileType)}
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-2xl font-semibold">{regulation.name}</h1>
                <Badge
                  className={
                    regulation.status === "active"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }
                >
                  {regulation.status === "active" ? "Хүчинтэй" : "Хүчингүй"}
                </Badge>
                <Badge variant="outline">v{regulation.version}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {regulation.fileName}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {regulation.description}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {isPdf && regulation.fileUrl && (
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="size-4 mr-2" />
                Preview харах
              </Button>
            )}
            {canDownload && regulation.fileUrl && (
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Download className="size-4 mr-2" />
                )}
                Татах
              </Button>
            )}
            {canEdit && regulation.status === "active" && (
              <Dialog
                open={showInactivateDialog}
                onOpenChange={setShowInactivateDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Ban className="size-4 mr-2" />
                    Хүчингүй болгох
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="size-5 text-amber-500" />
                      Журам хүчингүй болгох
                    </DialogTitle>
                    <DialogDescription>
                      Энэ үйлдлийг буцаах боломжгүй. Журмыг хүчингүй болгосны
                      дараа хувилбарын түүхэнд хадгалагдана.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-4">
                    <Label htmlFor="reason">Хүчингүй болгох шалтгаан *</Label>
                    <Textarea
                      id="reason"
                      value={inactivateReason}
                      onChange={(e) => setInactivateReason(e.target.value)}
                      placeholder="Шалтгаанаа бичнэ үү..."
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowInactivateDialog(false)}
                    >
                      Цуцлах
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleInactivate}
                      disabled={!inactivateReason || isInactivating}
                    >
                      {isInactivating && (
                        <Loader2 className="size-4 mr-2 animate-spin" />
                      )}
                      Хүчингүй болгох
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* PDF Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-2">
              <DialogTitle>{regulation.name}</DialogTitle>
              <DialogDescription>{regulation.fileName}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 min-h-0 px-6 pb-2">
              {regulation.fileUrl && (
                <iframe
                  src={`https://docs.google.com/viewer?url=${encodeURIComponent(regulation.fileUrl)}&embedded=true`}
                  className="w-full h-full rounded-lg border"
                  title={regulation.name}
                />
              )}
            </div>
            <DialogFooter className="px-6 pb-6">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Хаах
              </Button>
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <Download className="size-4 mr-2" />
                )}
                Татах
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inactive warning */}
        {regulation.status === "inactive" && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">
                    Энэ журам хүчингүй болсон
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    {regulation.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Дэлгэрэнгүй</TabsTrigger>
            <TabsTrigger value="permissions">Эрхийн мэдээлэл</TabsTrigger>
            <TabsTrigger value="history">
              <History className="size-4 mr-1" />
              Хувилбарын түүх
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Файлын мэдээлэл</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Файлын төрөл
                    </span>
                    <span className="font-medium uppercase">
                      {regulation.fileType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Хэмжээ
                    </span>
                    <span className="font-medium">
                      {formatFileSize(regulation.fileSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Хувилбар
                    </span>
                    <Badge variant="outline">v{regulation.version}</Badge>
                  </div>
                  {regulation.fileUrl && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Файлын холбоос
                      </span>
                      <a
                        href={regulation.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                      >
                        {regulation.fileUrl.substring(
                          regulation.fileUrl.lastIndexOf("/") + 1,
                        )}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Журмын мэдээлэл</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Бүлэг:
                    </span>
                    <span className="font-medium">
                      {getCategoryName(regulation.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Хариуцсан хэлтэс:
                    </span>
                    <span className="font-medium">
                      {getDeptName(regulation.department)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Батлагдсан:
                    </span>
                    <span className="font-medium">
                      {regulation.approvedDate
                        ? format(
                            new Date(regulation.approvedDate),
                            "yyyy-MM-dd",
                            { locale: mn },
                          )
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Оруулсан:
                    </span>
                    <span className="font-medium">
                      {regulation.uploadedBy || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Оруулсан огноо:
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(regulation.uploadedAt),
                        "yyyy-MM-dd HH:mm",
                        { locale: mn },
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="size-4" />
                    Харах эрхтэй хэлтсүүд
                  </CardTitle>
                  <CardDescription>
                    Эдгээр хэлтсүүд файлыг жагсаалтаас харах боломжтой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {regulation.viewPermissions?.length > 0 ? (
                      regulation.viewPermissions.map((deptId) => (
                        <Badge key={deptId} variant="secondary">
                          {getDeptName(deptId)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Бүх хэлтэс
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="size-4" />
                    Татах эрхтэй хэлтсүүд
                  </CardTitle>
                  <CardDescription>
                    Эдгээр хэлтсүүд файлыг татаж авах боломжтой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {regulation.downloadPermissions?.length > 0 ? (
                      regulation.downloadPermissions.map((deptId) => (
                        <Badge key={deptId} variant="secondary">
                          {getDeptName(deptId)}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Бүх хэлтэс
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Хувилбарын түүх</CardTitle>
                <CardDescription>
                  Энэ файлтай холбоотой бүх үйлдлүүд
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuditLogSection
                  fileId={regulation.id}
                  currentVersion={regulation.version}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
