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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  X,
  SlidersHorizontal,
  CalendarIcon,
  Filter,
} from "lucide-react";
import type { FilterOptions, Category } from "@/types/regulations";
import { format } from "date-fns";
import { mn } from "date-fns/locale";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Department {
  id: string | number
  name: string
}

interface RegulationsFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories?: Category[];
}

export function RegulationsFilters({
  filters,
  onFiltersChange,
  categories = [],
}: RegulationsFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Өөрийн backend-аас departments татна
  useEffect(() => {
    fetch(
      "http://intranet.bodigroup.mn/intranet/api/departments?api_key=int_api_7f766e223f04c1638db65580fcb356be2aeb3e79",
    )
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setDepartments(list);
      })
      .catch((err) => console.error("Хэлтэс татахад алдаа:", err));
  }, []);

  const handleSearchChange = (value: string) =>
    onFiltersChange({ ...filters, search: value });
  const handleDepartmentChange = (value: string) =>
    onFiltersChange({ ...filters, department: value });
  const handleCategoryChange = (value: string) =>
    onFiltersChange({ ...filters, category: value });
  const handleStatusChange = (value: string) =>
    onFiltersChange({ ...filters, status: value as FilterOptions["status"] });
  const handleSortChange = (value: string) =>
    onFiltersChange({ ...filters, sortBy: value as FilterOptions["sortBy"] });
  const handleDateFromChange = (date: Date | undefined) =>
    onFiltersChange({ ...filters, dateFrom: date });
  const handleDateToChange = (date: Date | undefined) =>
    onFiltersChange({ ...filters, dateTo: date });

  const clearFilters = () =>
    onFiltersChange({
      search: "",
      department: "all",
      category: "all",
      status: "all",
      sortBy: "newest",
      dateFrom: undefined,
      dateTo: undefined,
    });

  const hasActiveFilters =
    filters.search !== "" ||
    filters.department !== "all" ||
    filters.category !== "all" ||
    filters.status !== "all" ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined;

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Файлын нэрээр хайх..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Бүлэг — page.tsx-аас props-оор ирнэ (API-аас) */}
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[160px] bg-background">
            <SelectValue placeholder="Бүлэг сонгох" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх бүлэг</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Хэлтэс — өөрийн backend-аас */}
        <Select
          value={filters.department}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="Хэлтэс сонгох" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх хэлтэс</SelectItem>
            {departments.map((dept) => (
  <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[140px] bg-background">
            <SelectValue placeholder="Төлөв" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Бүх төлөв</SelectItem>
            <SelectItem value="active">Хүчинтэй</SelectItem>
            <SelectItem value="inactive">Хүчингүй</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="bg-background"
        >
          <Filter className="size-4 mr-2" />
          Нэмэлт
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4 mr-1" />
            Цэвэрлэх
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Үүссэн огноо:
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[140px] justify-start text-left font-normal bg-background"
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {filters.dateFrom ? (
                    format(filters.dateFrom, "yyyy-MM-dd", { locale: mn })
                  ) : (
                    <span className="text-muted-foreground">Эхлэх</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={handleDateFromChange}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground">-</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-[140px] justify-start text-left font-normal bg-background"
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {filters.dateTo ? (
                    format(filters.dateTo, "yyyy-MM-dd", { locale: mn })
                  ) : (
                    <span className="text-muted-foreground">Дуусах</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={handleDateToChange}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Эрэмбэлэх:</span>
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] bg-background">
                <SlidersHorizontal className="size-4 mr-2" />
                <SelectValue placeholder="Эрэмбэлэх" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Шинэ нь эхэндээ</SelectItem>
                <SelectItem value="oldest">Хуучин нь эхэндээ</SelectItem>
                <SelectItem value="name">Нэрээр (А-Я)</SelectItem>
                <SelectItem value="updated">Шинэчлэгдсэнээр</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
