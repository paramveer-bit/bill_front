"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfileButton } from "./UserProfile";
import Header from "./Header";

export function DashboardContent() {
  const stats = [
    {
      title: "Total Products",
      value: "1,234",
      description: "Active items in stock",
      icon: Package,
      trend: "+12%",
    },
    {
      title: "Customers",
      value: "856",
      description: "Registered customers",
      icon: Users,
      trend: "+8%",
    },
    {
      title: "Sales This Month",
      value: "$45,231",
      description: "Total revenue",
      icon: TrendingUp,
      trend: "+23%",
    },
    {
      title: "Purchases",
      value: "342",
      description: "Orders this month",
      icon: ShoppingCart,
      trend: "+15%",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header title="Dashboard" description="" />

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {stat.trend} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Latest transactions in your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    customer: "John Doe",
                    amount: "$234.50",
                    time: "2 hours ago",
                  },
                  {
                    customer: "Jane Smith",
                    amount: "$189.00",
                    time: "4 hours ago",
                  },
                  {
                    customer: "Bob Johnson",
                    amount: "$456.75",
                    time: "6 hours ago",
                  },
                  {
                    customer: "Alice Brown",
                    amount: "$123.25",
                    time: "8 hours ago",
                  },
                ].map((sale, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{sale.customer}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.time}
                      </p>
                    </div>
                    <div className="text-lg font-semibold">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Items that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { product: "Office Chair", stock: "5 left", sku: "SKU-001" },
                  { product: "Desk Lamp", stock: "3 left", sku: "SKU-045" },
                  { product: "Mouse Pad", stock: "8 left", sku: "SKU-078" },
                  { product: "USB Cable", stock: "12 left", sku: "SKU-092" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{item.product}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.sku}
                      </p>
                    </div>
                    <div className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                      {item.stock}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
