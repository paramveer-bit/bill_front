"use client";

import { DialogFooter } from "@/components/ui/dialog";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Tags,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Product = {
  id: number;
  sku: string;
  name: string;
  unit: string;
  currentSellPrice: number;
  taxRate: number;
  isStockItem: boolean;
  categoryId: number | null;
  categoryName: string | null;
};

type Category = {
  id: number;
  name: string;
  description: string;
};

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: 1,
      name: "Electronics",
      description: "Electronic devices and accessories",
    },
    {
      id: 2,
      name: "Computers",
      description: "Computer hardware and peripherals",
    },
    {
      id: 3,
      name: "Office Supplies",
      description: "Office and stationery items",
    },
  ]);

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      sku: "PRD001",
      name: "Laptop",
      unit: "Piece",
      currentSellPrice: 45000,
      taxRate: 18,
      isStockItem: true,
      categoryId: 2,
      categoryName: "Computers",
    },
    {
      id: 2,
      sku: "PRD002",
      name: "Mouse",
      unit: "Piece",
      currentSellPrice: 500,
      taxRate: 18,
      isStockItem: true,
      categoryId: 2,
      categoryName: "Computers",
    },
    {
      id: 3,
      sku: "PRD003",
      name: "Keyboard",
      unit: "Piece",
      currentSellPrice: 1200,
      taxRate: 18,
      isStockItem: true,
      categoryId: 2,
      categoryName: "Computers",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [categoryComboboxOpen, setCategoryComboboxOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });

  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    unit: "Piece",
    currentSellPrice: "",
    taxRate: "18",
    isStockItem: true,
    categoryId: "0",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategoryId === null || product.categoryId === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    const category = categories.find(
      (c) => c.id === Number.parseInt(formData.categoryId)
    );
    const newProduct: Product = {
      id: products.length + 1,
      sku: formData.sku,
      name: formData.name,
      unit: formData.unit,
      currentSellPrice: Number.parseFloat(formData.currentSellPrice),
      taxRate: Number.parseFloat(formData.taxRate),
      isStockItem: formData.isStockItem,
      categoryId: formData.categoryId
        ? Number.parseInt(formData.categoryId)
        : null,
      categoryName: category?.name || null,
    };
    setProducts([...products, newProduct]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditProduct = () => {
    if (editingProduct) {
      const category = categories.find(
        (c) => c.id === Number.parseInt(formData.categoryId)
      );
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...editingProduct,
                sku: formData.sku,
                name: formData.name,
                unit: formData.unit,
                currentSellPrice: Number.parseFloat(formData.currentSellPrice),
                taxRate: Number.parseFloat(formData.taxRate),
                isStockItem: formData.isStockItem,
                categoryId: formData.categoryId
                  ? Number.parseInt(formData.categoryId)
                  : null,
                categoryName: category?.name || null,
              }
            : p
        )
      );
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      currentSellPrice: product.currentSellPrice.toString(),
      taxRate: product.taxRate.toString(),
      isStockItem: product.isStockItem,
      categoryId: product.categoryId?.toString() || "0",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      sku: "",
      name: "",
      unit: "Piece",
      currentSellPrice: "",
      taxRate: "18",
      isStockItem: true,
      categoryId: "0",
    });
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: categories.length + 1,
      name: categoryFormData.name,
      description: categoryFormData.description,
    };
    setCategories([...categories, newCategory]);
    setIsAddCategoryDialogOpen(false);
    resetCategoryForm();
  };

  const handleEditCategory = () => {
    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? {
                ...editingCategory,
                name: categoryFormData.name,
                description: categoryFormData.description,
              }
            : c
        )
      );
      setIsEditCategoryDialogOpen(false);
      setEditingCategory(null);
      resetCategoryForm();
    }
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter((c) => c.id !== id));
    setProducts(
      products.map((p) =>
        p.categoryId === id ? { ...p, categoryId: null, categoryName: null } : p
      )
    );
  };

  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description,
    });
    setIsEditCategoryDialogOpen(true);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-6 p-8 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-muted-foreground">
                Manage your product inventory
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      placeholder="PRD001"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      placeholder="Piece, Kg, Liter, etc."
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Selling Price</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.currentSellPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentSellPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax Rate (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      placeholder="18"
                      value={formData.taxRate}
                      onChange={(e) =>
                        setFormData({ ...formData, taxRate: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stock">Stock Item</Label>
                    <Switch
                      id="stock"
                      checked={formData.isStockItem}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isStockItem: checked })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct}>Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium whitespace-nowrap">
                      Filter by Category:
                    </label>
                    <Popover
                      open={categoryComboboxOpen}
                      onOpenChange={setCategoryComboboxOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={categoryComboboxOpen}
                          className="w-[280px] justify-between bg-transparent"
                        >
                          {selectedCategoryId === null
                            ? `All Products (${products.length})`
                            : categories.find(
                                (cat) => cat.id === selectedCategoryId
                              )?.name +
                              ` (${
                                products.filter(
                                  (p) => p.categoryId === selectedCategoryId
                                ).length
                              })`}
                          <Tags className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0">
                        <Command>
                          <CommandInput placeholder="Search categories..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value="all-products"
                                onSelect={() => {
                                  setSelectedCategoryId(null);
                                  setCategoryComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCategoryId === null
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                All Products ({products.length})
                              </CommandItem>
                              {categories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.name}
                                  onSelect={() => {
                                    setSelectedCategoryId(category.id);
                                    setCategoryComboboxOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCategoryId === category.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {category.name} (
                                  {
                                    products.filter(
                                      (p) => p.categoryId === category.id
                                    ).length
                                  }
                                  )
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Sell Price</TableHead>
                        <TableHead className="text-right">Tax Rate</TableHead>
                        <TableHead className="text-center">
                          Stock Item
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">
                            {product.sku}
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>
                            {product.categoryName ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Tags className="h-3 w-3" />
                                {product.categoryName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">
                                -
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell className="text-right">
                            ₹{product.currentSellPrice.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.taxRate}%
                          </TableCell>
                          <TableCell className="text-center">
                            {product.isStockItem ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                No
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredProducts.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No products found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Product Categories
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Organize your products into categories
                      </p>
                    </div>
                    <Dialog
                      open={isAddCategoryDialogOpen}
                      onOpenChange={setIsAddCategoryDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button onClick={resetCategoryForm} size="sm">
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
                            <Label htmlFor="cat-name">Category Name *</Label>
                            <Input
                              id="cat-name"
                              placeholder="Enter category name"
                              value={categoryFormData.name}
                              onChange={(e) =>
                                setCategoryFormData({
                                  ...categoryFormData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cat-desc">Description</Label>
                            <Input
                              id="cat-desc"
                              placeholder="Enter category description"
                              value={categoryFormData.description}
                              onChange={(e) =>
                                setCategoryFormData({
                                  ...categoryFormData,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsAddCategoryDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddCategory}>
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
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              {category.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {category.description}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {
                                products.filter(
                                  (p) => p.categoryId === category.id
                                ).length
                              }{" "}
                              products
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditCategoryDialog(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
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
              </Card>
            </TabsContent>
          </Tabs>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Selling Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={formData.currentSellPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentSellPrice: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tax">Tax Rate (%)</Label>
                  <Input
                    id="edit-tax"
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-stock">Stock Item</Label>
                  <Switch
                    id="edit-stock"
                    checked={formData.isStockItem}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isStockItem: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditProduct}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isEditCategoryDialogOpen}
            onOpenChange={setIsEditCategoryDialogOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cat-name">Category Name *</Label>
                  <Input
                    id="edit-cat-name"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cat-desc">Description</Label>
                  <Input
                    id="edit-cat-desc"
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditCategoryDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditCategory}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
