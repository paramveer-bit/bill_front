"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  LogOut,
  Settings,
  Shield,
  Bell,
  ChevronRight,
  Camera,
  X,
  Building2,
  Calendar,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  company: string;
  joinDate: string;
  avatar: string | null;
  initials: string;
  stats: { label: string; value: string }[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USER: UserProfile = {
  name: "Alex Morgan",
  role: "Store Administrator",
  email: "alex.morgan@inventorypro.com",
  phone: "+1 (555) 012-3456",
  location: "San Francisco, CA",
  company: "InventoryPro Inc.",
  joinDate: "Member since Jan 2023",
  avatar: null,
  initials: "AM",
  stats: [
    { label: "Products", value: "1,234" },
    { label: "Orders", value: "342" },
    { label: "Customers", value: "856" },
  ],
};
import { useAuth } from "@/context/AuthContext";
// ─── Avatar Component ─────────────────────────────────────────────────────────

function Avatar({
  size = "md",
  interactive = false,
}: {
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}) {
  const sizeMap = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-20 w-20 text-2xl",
  };

  return (
    <div
      className={`relative inline-flex shrink-0 ${interactive ? "group" : ""}`}
    >
      <div
        className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-semibold text-white ring-2 ring-white shadow-md select-none`}
      >
        {USER.initials}
      </div>
      {interactive && (
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          <Camera className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown({
  onClose,
  onOpenFull,
}: {
  onClose: () => void;
  onOpenFull: () => void;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await logout();
      router.push("/login");
    } catch (error) {}
  };
  return (
    <div
      className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
      style={{ animation: "fadeSlideDown 0.15s ease-out" }}
    >
      {/* Top gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800" />

      {/* User info */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3 border-b border-border">
        <Avatar size="md" />
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {USER.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{USER.email}</p>
          <span className="inline-flex items-center mt-1 gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            <Shield className="h-3 w-3" />
            {USER.role}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {USER.stats.map((s) => (
          <div key={s.label} className="py-3 text-center">
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="py-2">
        {[
          { icon: User, label: "View Full Profile", action: onOpenFull },
          { icon: Settings, label: "Account Settings", action: onClose },
          { icon: Bell, label: "Notifications", action: onClose },
        ].map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors group"
          >
            <span className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              {label}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-border py-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Full Profile Panel (slide-over) ─────────────────────────────────────────

function ProfilePanel({ onClose }: { onClose: () => void }) {
  const [editing, setEditing] = useState(false);

  const infoFields = [
    { icon: Mail, label: "Email", value: USER.email },
    { icon: Phone, label: "Phone", value: USER.phone },
    { icon: MapPin, label: "Location", value: USER.location },
    { icon: Building2, label: "Company", value: USER.company },
    { icon: Calendar, label: "Joined", value: USER.joinDate },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease-out" }}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-card shadow-2xl border-l border-border flex flex-col"
        style={{ animation: "slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="relative">
          {/* Cover gradient */}
          <div className="h-28 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Avatar overlap */}
          <div className="px-6 pb-4">
            <div className="-mt-10 mb-3 flex items-end justify-between">
              <div className="ring-4 ring-card rounded-full">
                <Avatar size="lg" interactive />
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className={`mb-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  editing
                    ? "bg-slate-900 text-white"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                }`}
              >
                <Edit3 className="h-3 w-3" />
                {editing ? "Save" : "Edit Profile"}
              </button>
            </div>
            <h2 className="text-xl font-bold text-foreground">{USER.name}</h2>
            <p className="text-sm text-muted-foreground">{USER.role}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-6 mb-4 grid grid-cols-3 gap-3">
          {USER.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-muted/40 p-3 text-center"
            >
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info fields */}
        <div className="flex-1 overflow-y-auto px-6 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Contact & Details
          </p>
          {infoFields.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 py-3 border-b border-border last:border-0"
            >
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                {editing ? (
                  <input
                    defaultValue={value}
                    className="w-full text-sm font-medium bg-transparent border-b border-slate-300 focus:border-slate-700 outline-none py-0.5 text-foreground"
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground truncate">
                    {value}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Permissions */}
          <div className="mt-4 mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Permissions
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Products",
                "Customers",
                "Sales",
                "Suppliers",
                "Receipts",
                "Reports",
              ].map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ─── UserProfileButton (the header icon — export this) ────────────────────────

export function UserProfileButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="relative flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-border transition-all"
          aria-label="Open user profile"
        >
          <Avatar size="md" />
          {/* Online dot */}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
        </button>

        {dropdownOpen && (
          <ProfileDropdown
            onClose={() => setDropdownOpen(false)}
            onOpenFull={() => {
              setDropdownOpen(false);
              setPanelOpen(true);
            }}
          />
        )}
      </div>

      {panelOpen && <ProfilePanel onClose={() => setPanelOpen(false)} />}
    </>
  );
}

// ─── Updated DashboardContent showing integration ────────────────────────────

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

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
      {/* Header — UserProfileButton added to the right */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger />
          <h1 className="text-2xl font-semibold flex-1">Dashboard</h1>
          {/* ← Add this to every page header */}
          <UserProfileButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>

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
