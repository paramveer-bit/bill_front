"use client";

import { useState } from "react";
import { Folder, FolderOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Category, type Product } from "@/lib/types";
import { ProductItem } from "./ProductItem";

interface CategoryNodeProps {
  category: Category;
  productsByCategory: Record<string, Product[]>;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  level?: number;
}

export function CategoryNode({
  category,
  productsByCategory,
  onEdit,
  onDelete,
  deletingId,
  level = 0,
}: CategoryNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isRoot = level === 0;
  const hasChildren = category.children && category.children.length > 0;
  const categoryProducts = productsByCategory[category.id] || [];
  const hasContent = hasChildren || categoryProducts.length > 0;

  return (
    <div
      className={cn(
        "transition-all",
        isRoot
          ? "mb-4"
          : "ml-6 md:ml-10 border-l-2 border-slate-200/60 my-2 pl-2",
      )}
    >
      <div
        className={cn(
          "flex items-center p-1.5 cursor-pointer transition-all group select-none",
          isRoot
            ? "bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.995]"
            : "hover:bg-slate-100 rounded-lg",
          !hasContent && "opacity-50",
        )}
        onClick={() => hasContent && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className={cn(
              "p-2 rounded-lg transition-colors",
              isRoot
                ? "bg-slate-50 group-hover:bg-primary/10"
                : "bg-transparent",
            )}
          >
            {isOpen ? (
              <FolderOpen
                className={cn(
                  "h-5 w-5",
                  isRoot ? "text-primary" : "text-slate-500",
                )}
              />
            ) : (
              <Folder
                className={cn(
                  "h-5 w-5",
                  isRoot ? "text-slate-600" : "text-slate-400",
                )}
              />
            )}
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                "font-bold tracking-tight",
                isRoot ? "text-base text-slate-800" : "text-sm text-slate-600",
              )}
            >
              {category.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {categoryProducts.length} Products
              </span>
              {hasChildren && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {category.children?.length} Sections
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        {hasContent && (
          <div
            className={cn(
              "p-1.5 rounded-md transition-all",
              isOpen
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-400 group-hover:bg-slate-200",
            )}
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isOpen && "rotate-90",
              )}
            />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {category.children?.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              productsByCategory={productsByCategory}
              onEdit={onEdit}
              onDelete={onDelete}
              deletingId={deletingId}
              level={level + 1}
            />
          ))}
          {categoryProducts.length > 0 && (
            <div className="space-y-2 pt-1">
              {categoryProducts.map((p) => (
                <ProductItem
                  key={p.id}
                  product={p}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  deletingId={deletingId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
