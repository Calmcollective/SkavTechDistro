import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Shield, Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Warranty } from "@shared/schema";

const warrantySchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  invoiceNumber: z.string().optional(),
});

type WarrantyForm = z.infer<typeof warrantySchema>;

export default function WarrantyLookup() {
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const { toast } = useToast();

  const form = useForm<WarrantyForm>({
    resolver: zodResolver(warrantySchema),
    defaultValues: {
      serialNumber: "",
      invoiceNumber: "",
    },
  });

  const lookupMutation = useMutation({
    mutationFn: async (data: WarrantyForm) => {
      const response = await apiRequest("GET", `/api/warranty/${data.serialNumber}`);
      return response.json();
    },
    onSuccess: (data) => {
      setWarranty(data);
      toast({
        title: "Warranty Found",
        description: "Warranty information retrieved successfully.",
      });
    },
    onError: (error: any) => {
      setWarranty(null);
      toast({
        title: "Not Found",
        description: error.message || "No warranty found for this serial number.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WarrantyForm) => {
    lookupMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Shield className="text-primary mr-3 h-6 w-6" />
          Warranty Lookup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6">
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter device serial number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter invoice number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={lookupMutation.isPending}>
              <Search className="mr-2 h-4 w-4" />
              {lookupMutation.isPending ? "Checking..." : "Check Warranty Status"}
            </Button>
          </form>
        </Form>

        {/* Warranty Status Result */}
        {warranty && (
          <div className="p-4 bg-secondary/10 rounded-lg">
            <div className="flex items-center mb-3">
              <CheckCircle className="text-secondary text-xl mr-3 h-6 w-6" />
              <span className="text-lg font-semibold text-secondary">
                {warranty.isActive ? "Warranty Active" : "Warranty Expired"}
              </span>
            </div>
            <div className="space-y-2 text-sm text-neutral-600">
              <div><strong>Serial Number:</strong> {warranty.serialNumber}</div>
              <div>
                <strong>Purchase Date:</strong>{" "}
                {warranty.purchaseDate ? new Date(warranty.purchaseDate).toLocaleDateString() : "N/A"}
              </div>
              <div>
                <strong>Warranty Expires:</strong>{" "}
                {warranty.expiryDate ? new Date(warranty.expiryDate).toLocaleDateString() : "N/A"}
              </div>
              <div><strong>Coverage:</strong> {warranty.coverage}</div>
              {warranty.invoiceNumber && (
                <div><strong>Invoice Number:</strong> {warranty.invoiceNumber}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
