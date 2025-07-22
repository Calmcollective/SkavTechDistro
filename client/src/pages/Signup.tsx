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
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { UserPlus, Check, AlertCircle, Building2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import skavtechSquareLogo from "../assets/skavtech-logo-square.png";

const signupSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  
  // Contact Information
  phoneNumber: z.string().min(1, "Phone number is required"),
  countryCode: z.string().min(1, "Please select your country"),
  
  // Address Information
  city: z.string().min(1, "City is required"),
  address: z.string().optional(),
  
  // Account Information
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  accountType: z.enum(["individual", "business"]),
  
  // Business Information (conditional)
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  jobTitle: z.string().optional(),
  
  // Preferences
  primaryInterest: z.string().min(1, "Please select your primary interest"),
  communicationPreferences: z.array(z.string()).min(1, "Select at least one communication preference"),
  newsletter: z.boolean().default(true),
  
  // Legal
  agreeToTerms: z.boolean().refine(val => val, "You must agree to the terms and conditions"),
  agreeToMarketing: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.accountType === "business") {
    return data.companyName && data.companyName.length > 0 && 
           data.industry && data.industry.length > 0 &&
           data.jobTitle && data.jobTitle.length > 0;
  }
  return true;
}, {
  message: "Business information is required for business accounts",
  path: ["companyName"],
});

type SignupForm = z.infer<typeof signupSchema>;

const countryCodes = [
  { code: "+254", name: "Kenya", flag: "🇰🇪", supported: true },
  { code: "+1-US", name: "United States", flag: "🇺🇸", supported: false, displayCode: "+1" },
  { code: "+1-CA", name: "Canada", flag: "🇨🇦", supported: false, displayCode: "+1" },
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

// Additional data for form options
const industries = [
  "Technology", "Healthcare", "Education", "Finance", "Manufacturing", 
  "Retail", "Government", "Non-profit", "Telecommunications", "Other"
];

const companySizes = [
  "1-10 employees", "11-50 employees", "51-200 employees", 
  "201-500 employees", "500+ employees"
];

const interests = [
  "New Hardware", "Refurbished Devices", "Trade-in Services", 
  "Warranty & Repairs", "Fleet Management", "Bulk Purchases"
];

const communicationOptions = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "phone", label: "Phone Calls" }
];

export default function Signup() {
  const [accountType, setAccountType] = useState<"individual" | "business">("individual");
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      countryCode: "",
      city: "",
      address: "",
      password: "",
      confirmPassword: "",
      accountType: "individual",
      companyName: "",
      industry: "",
      companySize: "",
      jobTitle: "",
      primaryInterest: "",
      communicationPreferences: [],
      newsletter: true,
      agreeToTerms: false,
      agreeToMarketing: false,
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
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        password: data.password,
        phoneNumber: `${data.countryCode}${data.phoneNumber}`,
        countryCode: data.countryCode,
        city: data.city,
        address: data.address,
        accountType: data.accountType,
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        jobTitle: data.jobTitle,
        primaryInterest: data.primaryInterest,
        communicationPreferences: data.communicationPreferences,
        newsletter: data.newsletter,
        agreeToMarketing: data.agreeToMarketing,
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            {/* Account Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
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
                    <User className="h-4 w-4 text-primary" />
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
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="font-semibold">Business</div>
                  <div className="text-xs text-neutral-600">Corporate account</div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </>
        );

      case 2:
        return (
          <>
            {/* Contact & Location */}
            <div className="space-y-2 mb-4">
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
                              <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span className="text-xs">{country.displayCode || country.code}</span>
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
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );

      case 3:
        return (
          <>
            {/* Business Information (if business account) */}
            {accountType === "business" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companySizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {/* Password */}
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
          </>
        );

      case 4:
        return (
          <>
            {/* Preferences */}
            <FormField
              control={form.control}
              name="primaryInterest"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Primary Interest</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="What are you most interested in?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {interests.map((interest) => (
                        <SelectItem key={interest} value={interest}>
                          {interest}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Communication Preferences */}
            <FormField
              control={form.control}
              name="communicationPreferences"
              render={() => (
                <FormItem className="mb-6">
                  <FormLabel>How would you like us to contact you?</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {communicationOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="communicationPreferences"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option.id])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== option.id)
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Legal */}
            <div className="space-y-4">
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
                      <FormLabel className="text-sm">
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        Subscribe to our newsletter for updates and offers
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeToMarketing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        I agree to receive marketing communications
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6">
            <img 
              src={skavtechSquareLogo} 
              alt="Skavtech Solutions Ltd" 
              className="h-16 w-16 mx-auto rounded-lg object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Join Skavtech</h1>
          <p className="text-neutral-600">
            Create your account to access our ICT hardware distribution platform
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-primary text-white"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step < currentStep ? "bg-primary" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-600">
            <span>Personal Info</span>
            <span>Contact</span>
            <span>Account</span>
            <span>Preferences</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Contact Details"}
              {currentStep === 3 && "Account Setup"}
              {currentStep === 4 && "Preferences & Legal"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={signupMutation.isPending}
                    >
                      {signupMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-neutral-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}