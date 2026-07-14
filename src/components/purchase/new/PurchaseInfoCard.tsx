import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PurchaseInfoCard({ formData, setFormData, suppliers }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Purchase Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>
              Supplier <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.supplierId}
              onValueChange={(v) => setFormData({ ...formData, supplierId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex flex-col">
                      <span>{s.name}</span>
                      {s.contactName && (
                        <span className="text-xs text-muted-foreground">
                          {s.contactName}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Invoice Number <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="INV-2024-001"
              value={formData.invoiceNo}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNo: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Purchase Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData({ ...formData, purchaseDate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Received Date <span className="text-destructive">*</span>
            </Label>
            <Input
              type="date"
              value={formData.receivedAt}
              onChange={(e) =>
                setFormData({ ...formData, receivedAt: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
