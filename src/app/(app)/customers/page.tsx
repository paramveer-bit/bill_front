"use client";

// --------------------------------------Import Statements--------------------------------------
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Plus, Search, Pencil, Mail, Phone, FileText } from "lucide-react";

import Add_new_customer from "@/components/customer/Add_new_customer";
import axios from "axios";
import { showErrorToast } from "@/lib/helpers/toast";
import { Customer } from "@/lib/types";
import Header from "@/components/Header";
const BASE = process.env.NEXT_PUBLIC_BASEURL;

// --------------------------------------Customers Page Component--------------------------------------
export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.town.includes(searchTerm),
  );

  // Delete Customer option only for admin
  const handleDeleteCustomer = (id: string) => {
    // setCustomers(customers.filter((c) => c.id !== id));
  };

  const openAddDialog = () => {
    setSelectedCustomer(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const fetchCoustomer = async () => {
      try {
        const res = await axios.get(`${BASE}/customer`);
        setCustomers(res.data.data);
      } catch (error) {
        showErrorToast("Error while fetching coustomers data");
      }
    };
    fetchCoustomer();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Customers" description="Manage your customer database" />
      <div className="p-6 space-y-6">
        {/* <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer database
            </p>
          </div>
        </div> */}
        {/* Addd new Coustomer */}

        <Add_new_customer
          customers={customers}
          setCustomers={setCustomers}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          customerToEdit={selectedCustomer}
        />
        <Card className="gap-0">
          <CardHeader className=" px-4 border-b py-0 mb-0 gap-0">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Customer Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>GST Number</TableHead>
                  <TableHead>Town</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.gstNumber}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {customer.town}
                    </TableCell>
                    {/* --- Balance Column with Conditional Styling --- */}
                    <TableCell
                      className={`text-right font-bold ${
                        customer.balance > 0
                          ? "text-destructive"
                          : "text-green-600"
                      }`}
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
                        {/* Edit Button For Sutomer Details */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            openEditDialog(customer);
                          }}
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
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
