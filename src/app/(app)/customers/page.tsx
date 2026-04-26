"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
  Plus,
  Search,
  Pencil,
  Mail,
  Phone,
  FileText,
  Loader2,
} from "lucide-react";

import Add_new_customer from "@/components/customer/Add_new_customer";
import { showErrorToast } from "@/lib/helpers/toast";
import { Customer } from "@/lib/types";
import Header from "@/components/Header";
import { useApi } from "@/hooks/useApi";
import { AppPagination } from "@/components/AppPagination"; // Adjust path as needed

export default function CustomersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const api = useApi();

  // --- State ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  // Pagination & Filter Metadata
  const [metadata, setMetadata] = useState({
    totalItems: 0,
    totalPages: 0,
    pageSize: 10,
  });

  // Get values from URL or default
  const currentPage = Number(searchParams.get("page")) || 1;
  const searchTerm = searchParams.get("search") || "";

  // --- Helpers ---
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });
      return newSearchParams.toString();
    },
    [searchParams],
  );

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Sending search and page as query parameters to backend
      const res = await api.get(`/customers`, {
        params: {
          page: currentPage,
          limit: metadata.pageSize,
          search: searchTerm,
        },
      });

      // Assuming backend returns: { data: [...], total: 100, totalPages: 10 }
      setCustomers(res.data.data.data || []);
      setMetadata((prev) => ({
        ...prev,
        totalItems: res.data.data.meta.totalRecords || 0,
        totalPages: res.data.data.meta.totalPages || 1,
      }));
    } catch (error) {
      showErrorToast("Error while fetching customers data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever URL params change
  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  // --- Handlers ---
  const handleSearchChange = (val: string) => {
    const query = createQueryString({ search: val, page: 1 }); // Reset to page 1 on new search
    router.push(`${pathname}?${query}`);
  };

  const handlePageChange = (newPage: number) => {
    const query = createQueryString({ page: newPage });
    router.push(`${pathname}?${query}`);
  };

  const openAddDialog = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Customers" description="Manage your customer database" />
      <div className="p-6 space-y-6">
        <Add_new_customer
          customers={customers}
          setCustomers={setCustomers}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          customerToEdit={selectedCustomer}
        />
        <Card className="gap-0">
          <CardHeader className="px-4 border-b py-0 mb-0 gap-0">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  defaultValue={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={openAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="pl-4">Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Town</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{customer.gstNumber}</TableCell>
                      <TableCell>{customer.town}</TableCell>
                      <TableCell
                        className={`text-right font-bold ${customer.balance > 0 ? "text-destructive" : "text-green-600"}`}
                      >
                        ₹{customer.balance.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/customers/${customer.id}/ledger`)
                            }
                          >
                            <FileText className="mr-1 h-3 w-3" /> Ledger
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* --- Integration of your AppPagination Component --- */}
            <AppPagination
              page={currentPage}
              totalPages={metadata.totalPages}
              totalItems={metadata.totalItems}
              pageSize={metadata.pageSize}
              onPageChange={handlePageChange}
              tableLoading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
