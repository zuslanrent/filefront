"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
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
import { FileUploadZone } from "./file-upload-zone";
import { PermissionSelector } from "./permission-selector";
import {
  NotificationSelector,
  type NotificationConfig,
} from "./notification-selector";
import { currentUser } from "@/lib/mock-data/users";
import type { Category } from "@/types/regulations";
import { CalendarIcon, Loader2, ArrowLeft, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { mn } from "date-fns/locale";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const DEPT_URL =
  "http://intranet.bodigroup.mn/intranet/api/departments?api_key=int_api_7f766e223f04c1638db65580fcb356be2aeb3e79";

interface Department {
  id: string | number;
  name: string;
}

export function UploadForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [approvedDate, setApprovedDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [viewPermissions, setViewPermissions] = useState<string[]>([]);
  const [downloadPermissions, setDownloadPermissions] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [notificationConfig, setNotificationConfig] =
    useState<NotificationConfig>({
      type: "all",
      departments: [],
      users: [],
      groupEmail: "",
    });

  useEffect(() => {
    // Groups татах
    fetch(`${API_URL}/api/groups`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(
            data.data.map((g: any) => ({
              id: g.uuid,
              name: g.group_name,
              description: g.description || "",
            })),
          );
        }
      })
      .catch((err) => console.error("Бүлэг татахад алдаа:", err));

    // Departments — intranet API-аас татах
    fetch(DEPT_URL)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setDepartments(list);
      })
      .catch((err) => console.error("Хэлтэс татахад алдаа:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name ||
      !department ||
      !category ||
      !approvedDate ||
      files.length === 0
    ) {
      alert("Бүх талбарыг бөглөнө үү");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const authHeader: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        formData.append("group_name", category);
        formData.append("division_name", department);
        formData.append("description", description);
        formData.append(
          "approved_date",
          approvedDate ? format(approvedDate, "yyyy-MM-dd") : "",
        );
        formData.append("uploaded_by", currentUser.id);
        formData.append("uploaded_by_name", currentUser.name);
        // ← Permissions нэмэх
        formData.append("view_permissions", JSON.stringify(viewPermissions));
        formData.append(
          "download_permissions",
          JSON.stringify(downloadPermissions),
        );

        const uploadRes = await fetch(`${API_URL}/api/regulations/upload`, {
          method: "POST",
          headers: { ...authHeader },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          alert(`Файл оруулахад алдаа: ${uploadData.message}`);
        }
      }
      router.push("/regulations");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/regulations">
            <ArrowLeft className="size-4 mr-2" />
            Буцах
          </Link>
        </Button>
      </div>

      {/* Файл оруулах */}
      <Card>
        <CardHeader>
          <CardTitle>Файл оруулах</CardTitle>
          <CardDescription>
            PDF, DOC, DOCX, XLS, XLSX файл оруулах боломжтой
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone files={files} onFilesChange={setFiles} />
        </CardContent>
      </Card>

      {/* Үндсэн мэдээлэл */}
      <Card>
        <CardHeader>
          <CardTitle>Үндсэн мэдээлэл</CardTitle>
          <CardDescription>
            Журмын нэр, бүлэг болон хариуцсан хэлтэс
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Журмын нэр *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Жишээ: Ажилтны ёс зүйн дүрэм"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Бүлэг — өөрийн API-аас */}
            <div className="space-y-2">
              <Label htmlFor="category">Бүлэг *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Бүлэг сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Хэлтэс — intranet API-аас */}
            <div className="space-y-2">
              <Label htmlFor="department">Хариуцсан хэлтэс *</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Хэлтэс сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Батлагдсан огноо */}
          <div className="space-y-2">
            <Label>Батлагдсан огноо *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {approvedDate ? (
                    format(approvedDate, "yyyy-MM-dd", { locale: mn })
                  ) : (
                    <span className="text-muted-foreground">Огноо сонгох</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={approvedDate}
                  onSelect={setApprovedDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Тайлбар */}
          <div className="space-y-2">
            <Label htmlFor="description">Тайлбар</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Журмын товч тайлбар..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="size-4" />
              <span>
                Хэн оруулсан:{" "}
                <span className="text-foreground font-medium">
                  {currentUser.name}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>
                Хэзээ:{" "}
                <span className="text-foreground font-medium">
                  {format(new Date(), "yyyy-MM-dd HH:mm", { locale: mn })}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Эрхийн тохиргоо */}
      <Card>
        <CardHeader>
          <CardTitle>Эрхийн тохиргоо</CardTitle>
          <CardDescription>
            Аль хэлтсүүд энэ файлыг харах, татах боломжтойг тохируулна
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PermissionSelector
            title="Харах эрх"
            description="Эдгээр хэлтсүүд файлыг жагсаалтаас харж, дэлгэрэнгүй мэдээлэл үзэх боломжтой"
            selectedDepartments={viewPermissions}
            onSelectionChange={setViewPermissions}
          />
          <PermissionSelector
            title="Татах эрх"
            description="Эдгээр хэлтсүүд файлыг татаж авах боломжтой"
            selectedDepartments={downloadPermissions}
            onSelectionChange={setDownloadPermissions}
          />
        </CardContent>
      </Card>

      {/* Мэдэгдлийн тохиргоо */}
      <Card>
        <CardHeader>
          <CardTitle>Мэдэгдлийн тохиргоо</CardTitle>
          <CardDescription>
            Шинэ журам нэмэгдсэн тухай хэнд мэдэгдэл илгээхийг тохируулна
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationSelector
            value={notificationConfig}
            onChange={setNotificationConfig}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" asChild>
          <Link href="/regulations">Цуцлах</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting || files.length === 0}>
          {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
          {isSubmitting ? "Хадгалж байна..." : "Хадгалах"}
        </Button>
      </div>
    </form>
  );
}
