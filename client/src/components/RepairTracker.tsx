import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wrench, Search, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { RepairTicket } from "@shared/schema";

const repairSearchSchema = z.object({
  ticketId: z.string().min(1, "Repair ticket ID is required"),
});

const newRepairSchema = z.object({
  serialNumber: z.string().min(1, "Serial number is required"),
  deviceModel: z.string().min(1, "Device model is required"),
  issueDescription: z.string().min(10, "Please provide a detailed description"),
  customerInfo: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(1, "Phone is required"),
  }),
});

type RepairSearchForm = z.infer<typeof repairSearchSchema>;
type NewRepairForm = z.infer<typeof newRepairSchema>;

export default function RepairTracker() {
  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [showNewRepairForm, setShowNewRepairForm] = useState(false);
  const { toast } = useToast();

  const searchForm = useForm<RepairSearchForm>({
    resolver: zodResolver(repairSearchSchema),
    defaultValues: { ticketId: "" },
  });

  const newRepairForm = useForm<NewRepairForm>({
    resolver: zodResolver(newRepairSchema),
    defaultValues: {
      serialNumber: "",
      deviceModel: "",
      issueDescription: "",
      customerInfo: {
        name: "",
        email: "",
        phone: "",
      },
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: RepairSearchForm) => {
      const response = await apiRequest("GET", `/api/repairs/${data.ticketId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setTicket(data);
      toast({
        title: "Repair Ticket Found",
        description: "Repair status retrieved successfully.",
      });
    },
    onError: (error: any) => {
      setTicket(null);
      toast({
        title: "Not Found",
        description: error.message || "No repair ticket found with this ID.",
        variant: "destructive",
      });
    },
  });

  const submitRepairMutation = useMutation({
    mutationFn: async (data: NewRepairForm) => {
      const response = await apiRequest("POST", "/api/repairs", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Repair Request Submitted",
        description: `Your repair ticket ${data.ticketId} has been created.`,
      });
      setTicket(data);
      setShowNewRepairForm(false);
      newRepairForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit repair request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSearch = (data: RepairSearchForm) => {
    searchMutation.mutate(data);
  };

  const onSubmitRepair = (data: NewRepairForm) => {
    submitRepairMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-blue-100 text-blue-800";
      case "diagnosed": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-orange-100 text-orange-800";
      case "qc": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received": return "🔷";
      case "diagnosed": return "🔍";
      case "in_progress": return "🔧";
      case "qc": return "✅";
      case "completed": return "✨";
      default: return "⚪";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Wrench className="text-accent mr-3 h-6 w-6" />
          Repair Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showNewRepairForm ? (
          <div>
            <Form {...searchForm}>
              <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4 mb-6">
                <FormField
                  control={searchForm.control}
                  name="ticketId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repair Ticket ID</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., RPR-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={searchMutation.isPending}>
                  <Search className="mr-2 h-4 w-4" />
                  {searchMutation.isPending ? "Searching..." : "Track Repair Status"}
                </Button>
              </form>
            </Form>

            {/* Repair Status Timeline */}
            {ticket && (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-primary mb-2">
                    Current Status: {ticket.status.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-neutral-600 mb-3">
                    Estimated completion: {ticket.estimatedCompletion ? 
                      new Date(ticket.estimatedCompletion).toLocaleDateString() : "TBD"}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Last updated: {new Date(ticket.updatedAt).toLocaleString()}
                  </div>
                </div>

                {/* Status History */}
                {ticket.statusHistory && Array.isArray(ticket.statusHistory) && (
                  <div className="space-y-4">
                    {ticket.statusHistory.map((status: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-3 text-sm">
                          {getStatusIcon(status.status)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-secondary capitalize">
                            {status.status.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {new Date(status.timestamp).toLocaleString()}
                          </div>
                          {status.notes && (
                            <div className="text-xs text-neutral-500">{status.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Submit New Repair Request</h3>
              <Button variant="ghost" onClick={() => setShowNewRepairForm(false)}>
                Cancel
              </Button>
            </div>
            
            <Form {...newRepairForm}>
              <form onSubmit={newRepairForm.handleSubmit(onSubmitRepair)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={newRepairForm.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Device serial number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={newRepairForm.control}
                    name="deviceModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Dell Latitude 7420" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={newRepairForm.control}
                  name="issueDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the issue in detail..." 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={newRepairForm.control}
                    name="customerInfo.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={newRepairForm.control}
                    name="customerInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={newRepairForm.control}
                    name="customerInfo.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+254 700 123 456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={submitRepairMutation.isPending}
                >
                  {submitRepairMutation.isPending ? "Submitting..." : "Submit Repair Request"}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Submit New Repair Request Toggle */}
        {!showNewRepairForm && (
          <div className="pt-6 border-t border-neutral-200">
            <Button 
              onClick={() => setShowNewRepairForm(true)}
              variant="outline" 
              className="w-full border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Submit New Repair Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
