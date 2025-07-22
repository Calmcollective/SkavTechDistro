import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { UserPlus, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  countryCode: z.string().min(1, "Please select your country"),
  accountType: z.enum(["individual", "business"]),
  companyName: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val, "You must agree to the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === "business") {
    return data.companyName && data.companyName.length > 0;
  }
  return true;
}, {
  message: "Company name is required for business accounts",
  path: ["companyName"],
});

type SignupForm = z.infer<typeof signupSchema>;

const countryCodes = [
  { code: "+254", name: "Kenya", flag: "🇰🇪", supported: true },
  { code: "+1", name: "United States", flag: "🇺🇸", supported: false },
  { code: "+1", name: "Canada", flag: "🇨🇦", supported: false },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", supported: false },
  { code: "+33", name: "France", flag: "🇫🇷", supported: false },
  { code: "+49", name: "Germany", flag: "🇩🇪", supported: false },
  { code: "+39", name: "Italy", flag: "🇮🇹", supported: false },
  { code: "+34", name: "Spain", flag: "🇪🇸", supported: false },
  { code: "+31", name: "Netherlands", flag: "🇳🇱", supported: false },
  { code: "+46", name: "Sweden", flag: "🇸🇪", supported: false },
  { code: "+47", name: "Norway", flag: "🇳🇴", supported: false },
  { code: "+45", name: "Denmark", flag: "🇩🇰", supported: false },
  { code: "+41", name: "Switzerland", flag: "🇨🇭", supported: false },
  { code: "+43", name: "Austria", flag: "🇦🇹", supported: false },
  { code: "+32", name: "Belgium", flag: "🇧🇪", supported: false },
  { code: "+61", name: "Australia", flag: "🇦🇺", supported: false },
  { code: "+64", name: "New Zealand", flag: "🇳🇿", supported: false },
  { code: "+81", name: "Japan", flag: "🇯🇵", supported: false },
  { code: "+82", name: "South Korea", flag: "🇰🇷", supported: false },
  { code: "+86", name: "China", flag: "🇨🇳", supported: false },
  { code: "+91", name: "India", flag: "🇮🇳", supported: false },
  { code: "+65", name: "Singapore", flag: "🇸🇬", supported: false },
  { code: "+60", name: "Malaysia", flag: "🇲🇾", supported: false },
  { code: "+66", name: "Thailand", flag: "🇹🇭", supported: false },
  { code: "+84", name: "Vietnam", flag: "🇻🇳", supported: false },
  { code: "+62", name: "Indonesia", flag: "🇮🇩", supported: false },
  { code: "+63", name: "Philippines", flag: "🇵🇭", supported: false },
  { code: "+27", name: "South Africa", flag: "🇿🇦", supported: false },
  { code: "+234", name: "Nigeria", flag: "🇳🇬", supported: false },
  { code: "+20", name: "Egypt", flag: "🇪🇬", supported: false },
  { code: "+212", name: "Morocco", flag: "🇲🇦", supported: false },
  { code: "+233", name: "Ghana", flag: "🇬🇭", supported: false },
  { code: "+256", name: "Uganda", flag: "🇺🇬", supported: false },
  { code: "+255", name: "Tanzania", flag: "🇹🇿", supported: false },
  { code: "+250", name: "Rwanda", flag: "🇷🇼", supported: false },
  { code: "+55", name: "Brazil", flag: "🇧🇷", supported: false },
  { code: "+54", name: "Argentina", flag: "🇦🇷", supported: false },
  { code: "+56", name: "Chile", flag: "🇨🇱", supported: false },
  { code: "+57", name: "Colombia", flag: "🇨🇴", supported: false },
  { code: "+52", name: "Mexico", flag: "🇲🇽", supported: false },
  { code: "+7", name: "Russia", flag: "🇷🇺", supported: false },
  { code: "+48", name: "Poland", flag: "🇵🇱", supported: false },
  { code: "+420", name: "Czech Republic", flag: "🇨🇿", supported: false },
  { code: "+36", name: "Hungary", flag: "🇭🇺", supported: false },
  { code: "+40", name: "Romania", flag: "🇷🇴", supported: false },
  { code: "+30", name: "Greece", flag: "🇬🇷", supported: false },
  { code: "+351", name: "Portugal", flag: "🇵🇹", supported: false },
  { code: "+90", name: "Turkey", flag: "🇹🇷", supported: false },
  { code: "+971", name: "UAE", flag: "🇦🇪", supported: false },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", supported: false },
];

export default function Signup() {
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const { toast } = useToast();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      countryCode: "",
      accountType: "individual",
      companyName: "",
      agreeToTerms: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupForm) => {
      // Check if country is supported
      const selectedCountry = countryCodes.find(c => c.code === data.countryCode);
      if (!selectedCountry?.supported) {
        throw new Error(`Registration is currently only available for Kenya. We'll be expanding to ${selectedCountry?.name} soon!`);
      }

      const response = await apiRequest("POST", "/api/auth/register", {
        username: data.username,
        email: data.email,
        password: data.password,
        phoneNumber: `${data.countryCode}${data.phoneNumber}`,
        accountType: data.accountType,
        companyName: data.companyName,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Created Successfully",
        description: "Welcome to Skavtech! You can now start using our services.",
      });
      // TODO: Redirect to login or dashboard
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupForm) => {
    signupMutation.mutate(data);
  };

  const handleAccountTypeChange = (type: "individual" | "business") => {
    setAccountType(type);
    form.setValue("accountType", type);
    if (type === "individual") {
      form.setValue("companyName", "");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Join Skavtech</h1>
          <p className="text-neutral-600">
            Create your account to access our ICT hardware distribution platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Account Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => handleAccountTypeChange("individual")}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      accountType === "individual"
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                      </div>
                      <div className="font-semibold">Individual</div>
                      <div className="text-xs text-neutral-600">Personal account</div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleAccountTypeChange("business")}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      accountType === "business"
                        ? "border-primary bg-primary/5"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <UserPlus className="h-4 w-4 text-primary" />
                      </div>
                      <div className="font-semibold">Business</div>
                      <div className="text-xs text-neutral-600">Corporate account</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Company Name for Business Accounts */}
                {accountType === "business" && (
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Phone Number with Country Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-60">
                                {countryCodes.map((country) => (
                                  <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                                    <div className="flex items-center gap-2">
                                      <span>{country.flag}</span>
                                      <span className="text-xs">{country.code}</span>
                                      <span className="text-xs text-neutral-600 hidden sm:inline">
                                        {country.name}
                                      </span>
                                      {country.supported && (
                                        <Check className="h-3 w-3 text-green-600" />
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="700123456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <strong>Note:</strong> Currently, we only support Kenyan phone numbers (+254). 
                      International support will be available soon!
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Confirm password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <label className="text-sm">
                          I agree to the{" "}
                          <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </Link>
                        </label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-neutral-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline font-semibold">
                    Sign in here
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}