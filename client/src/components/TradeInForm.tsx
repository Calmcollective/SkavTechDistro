import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calculator, Check, Calendar, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const tradeInSchema = z.object({
  deviceType: z.string().min(1, "Device type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  age: z.string().min(1, "Age is required"),
  condition: z.string().min(1, "Condition is required"),
});

type TradeInForm = z.infer<typeof tradeInSchema>;

export default function TradeInForm() {
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<TradeInForm>({
    resolver: zodResolver(tradeInSchema),
    defaultValues: {
      deviceType: "",
      brand: "",
      model: "",
      age: "",
      condition: "",
    },
  });

  const estimateMutation = useMutation({
    mutationFn: async (data: TradeInForm) => {
      const response = await apiRequest("POST", "/api/trade-in/estimate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setEstimatedValue(data.estimatedValue);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to calculate trade-in estimate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: TradeInForm & { estimatedValue: number }) => {
      const response = await apiRequest("POST", "/api/trade-in", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Trade-in Request Submitted",
        description: "We'll contact you soon to arrange pickup or drop-off.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit trade-in request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TradeInForm) => {
    estimateMutation.mutate(data);
  };

  const handleSchedulePickup = () => {
    if (estimatedValue && form.getValues()) {
      submitMutation.mutate({
        ...form.getValues(),
        estimatedValue,
        customerInfo: { status: "pickup_requested" }
      });
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Hi! I'd like to trade in my ${form.getValues("brand")} ${form.getValues("model")} (${form.getValues("condition")} condition). Estimated value: $${estimatedValue}`;
    const whatsappUrl = `https://wa.me/1234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trade-in Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Device Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select device type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="laptop">Laptop</SelectItem>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="server">Server</SelectItem>
                          <SelectItem value="tablet">Tablet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dell">Dell</SelectItem>
                          <SelectItem value="hp">HP</SelectItem>
                          <SelectItem value="lenovo">Lenovo</SelectItem>
                          <SelectItem value="apple">Apple</SelectItem>
                          <SelectItem value="asus">ASUS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ThinkPad T14, MacBook Pro 13" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select age..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-2">1-2 years</SelectItem>
                          <SelectItem value="2-3">2-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="excellent" id="excellent" />
                              <Label htmlFor="excellent">Excellent - Like new, no visible wear</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="good" id="good" />
                              <Label htmlFor="good">Good - Minor wear, fully functional</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fair" id="fair" />
                              <Label htmlFor="fair">Fair - Visible wear, some issues</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="poor" id="poor" />
                              <Label htmlFor="poor">Poor - Significant wear, major issues</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90" 
                  disabled={estimateMutation.isPending}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  {estimateMutation.isPending ? "Calculating..." : "Get Instant Quote"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Estimated Value */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Estimated Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-lg p-6 text-white text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                ${estimatedValue?.toLocaleString() || "0"}
              </div>
              <div className="text-lg opacity-90">Estimated Trade-in Value</div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-secondary mr-3" />
                <span>Free pickup or drop-off service</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-secondary mr-3" />
                <span>Professional data wiping</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-secondary mr-3" />
                <span>Instant payment upon approval</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-secondary mr-3" />
                <span>Environmental responsible recycling</span>
              </div>
            </div>

            {estimatedValue && (
              <div className="space-y-3">
                <Button 
                  onClick={handleSchedulePickup}
                  className="w-full"
                  disabled={submitMutation.isPending}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {submitMutation.isPending ? "Scheduling..." : "Schedule Pickup"}
                </Button>
                <Button 
                  onClick={handleWhatsAppContact}
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact via WhatsApp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
