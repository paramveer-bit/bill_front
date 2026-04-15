"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Pencil,
  Phone,
  Mail,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import axios from "axios";
import { showErrorToast } from "@/lib/helpers/toast";
import { type Supplier } from "@/lib/types";
import Add_edit_supplier from "@/components/supplier/Add_edit_supplier";
import { useRouter } from "next/navigation";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

export default function SuppliersPage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await axios.get(`${BASE}/supplier`);
        setSuppliers(res.data.data);
      } catch (error) {
        showErrorToast("Error while fetching suppliers data");
      }
    };
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.address.includes(searchTerm),
  );

  const openAddDialog = () => {
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Suppliers & Vendors
              </h1>
              <p className="text-muted-foreground italic">
                Manage procurement sources and payables
              </p>
            </div>
          </div>

          {/*------------------------------- Add New Supplier Dialog Box -------------------------- */}
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
          <Add_edit_supplier
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            supplierToEdit={selectedSupplier}
          />
          {/* Search and Table */}
          <Card className="shadow-sm overflow-hidden border-none">
            <CardHeader className="bg-white border-b">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, GST or phone..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Supplier Detail</TableHead>
                  <TableHead className="font-bold">Contact Person</TableHead>
                  <TableHead className="font-bold">GSTIN</TableHead>
                  <TableHead className="font-bold text-right">
                    Outstanding Balance
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {filteredSuppliers.map((s: any) => (
                  <TableRow
                    key={s.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" /> {s.phone}
                        </span>
                        <span className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" /> {s.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {s.contactName || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px]"
                      >
                        {s.gstNumber || "URD"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-destructive">
                      ₹{Number(s.balance || 0).toLocaleString()}
                      <ArrowUpRight className="inline h-3 w-3 ml-1 opacity-50" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/suppliers/${s.id}/ledger`)
                          }
                        >
                          <FileText className="mr-1 h-3 w-3" /> Ledger
                        </Button>
                        {/* ------------------Edit Supplier Details-------------------------------- */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(s)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
