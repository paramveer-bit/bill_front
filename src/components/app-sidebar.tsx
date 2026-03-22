"use client";

import {
  Package,
  Users,
  ShoppingCart,
  Receipt,
  BarChart3,
  FileText,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", icon: BarChart3, href: "/" },
  { title: "Products", icon: Package, href: "/products" },
  { title: "Customers", icon: Users, href: "/customers" },
  { title: "Suppliers", icon: Truck, href: "/suppliers" },
  { title: "Purchase", icon: ShoppingCart, href: "/purchase" },
  { title: "Sales", icon: FileText, href: "/sales" },
  { title: "Receipts", icon: Receipt, href: "/receipts" },
  { title: "Supplier Payments", icon: Wallet, href: "/supplier-payments" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">InventoryPro</h2>
            <p className="text-xs text-muted-foreground">Manage with ease</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
