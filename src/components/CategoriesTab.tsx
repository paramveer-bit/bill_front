"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

import { type Category, type Product, buildCategoryTree } from "@/lib/types";
import { AxiosError } from "axios";
import { showErrorToast } from "@/lib/helpers/toast";
import { useApi } from "@/hooks/useApi";
// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoriesTabProps {
  categories: Category[];
  products: Product[];
  onCategoriesChange: (categories: Category[]) => void;
  onProductsChange: (products: Product[]) => void;
}

// ─── Default form state ───────────────────────────────────────────────────────

const defaultForm = { name: "", description: "", parentId: "0" };

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoriesTab({
  categories,
  products,
  onCategoriesChange,
  onProductsChange,
}: CategoriesTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState(defaultForm);

  const categoryTree = buildCategoryTree(categories);
  const topLevel = categories.filter((c) => c.parentId === null);
  const api = useApi();
  // ── handlers ────────────────────────────────────────────────────────────────

  const handleAdd = async () => {
    try {
      console.log(form.parentId);
      const res = await api.post(`/categories`, {
        name: form.name,
        description: form.description,
        parentId: form.parentId !== "0" ? form.parentId : null,
      });
      const newCategory: Category = res.data.data;
      onCategoriesChange([...categories, newCategory]);
      setIsAddOpen(false);
      setForm(defaultForm);
    } catch (err) {
      const error = err as AxiosError<any>;
      const errorMessage =
        error.response?.data?.errors?.[0]?.message || "Try again later";
      showErrorToast(errorMessage);
    }
  };

  const handleEdit = async () => {
    try {
      const res = await api.put(`/categories/${editingCategory?.id}`, {
        name: form.name,
        description: form.description,
        parentId: form.parentId !== "0" ? form.parentId : null,
      });
      const updatedCategory: Category = res.data.data;
      onCategoriesChange(
        categories.map((c) =>
          c.id === updatedCategory.id ? updatedCategory : c,
        ),
      );

      setIsEditOpen(false);
      setEditingCategory(null);
      setForm(defaultForm);
    } catch (error) {
      const err = error as AxiosError<any>;
      const errorMessage =
        err.response?.data?.errors?.[0]?.message || "Try again later";
      showErrorToast(errorMessage);
    }
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description,
      parentId: category.parentId?.toString() ?? "0",
    });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/categories/${id}`);
      const subIds = categories
        .filter((c) => c.parentId === id)
        .map((c) => c.id);
      const removeIds = [id, ...subIds];
      onCategoriesChange(categories.filter((c) => !removeIds.includes(c.id)));
      onProductsChange(
        products.map((p) =>
          removeIds.includes(p.categoryId ? p.categoryId : "")
            ? { ...p, categoryId: null }
            : p,
        ),
      );
    } catch (error) {
      const err = error as AxiosError<any>;
      const errorMessage =
        err.response?.data?.errors?.[0]?.message || "Try again later";
      showErrorToast(errorMessage);
    }
  };

  // ── count helpers ────────────────────────────────────────────────────────────

  const countForParent = (parentId: string | null) => {
    const childIds = categories
      .filter((c) => c.parentId === parentId)
      .map((c) => c.id);
    return products.filter(
      (p) =>
        p.categoryId === parentId || childIds.includes(p.categoryId ?? " "),
    ).length;
  };

  const countForChild = (childId: string) =>
    products.filter((p) => p.categoryId === childId).length;

  // ── shared parent selector ───────────────────────────────────────────────────

  const ParentSelect = ({
    value,
    onChange,
    excludeId,
  }: {
    value: string;
    onChange: (v: string) => void;
    excludeId?: string;
  }) => (
    <div className="space-y-2">
      <Label>Parent Category</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="None (top-level category)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">None (top-level)</SelectItem>
          {topLevel
            .filter((c) => c.id !== excludeId)
            .map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  {c.name}
                </span>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Only top-level categories can be parents (max 2 levels).
      </p>
    </div>
  );

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Product Categories</h3>
            <p className="text-sm text-muted-foreground">
              Organize your products into categories and subcategories
            </p>
          </div>

          {/* ── Add Category Dialog ── */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setForm(defaultForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Category Name *</Label>
                  <Input
                    placeholder="Enter category name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Enter description (optional)"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <ParentSelect
                  value={form.parentId}
                  onChange={(v) => setForm({ ...form, parentId: v })}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={!form.name.trim()}>
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryTree.map((parent) => (
              <>
                {/* ── Parent row ── */}
                <TableRow key={`row-p-${parent.id}`} className="bg-muted/30">
                  <TableCell className="font-semibold">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-amber-500" />
                      {parent.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {parent.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">
                      {countForParent(parent.id)} products
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(parent)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(parent.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* ── Child rows ── */}
                {parent.children?.map((child) => (
                  <TableRow key={`row-c-${child.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2 pl-6">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{child.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {child.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {countForChild(child.id)} products
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(child)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(child.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No categories found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* ── Edit Category Dialog ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <ParentSelect
              value={form.parentId}
              onChange={(v) => setForm({ ...form, parentId: v })}
              excludeId={editingCategory?.id}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={!form.name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
