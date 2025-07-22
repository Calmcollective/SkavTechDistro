import WarrantyLookup from "@/components/WarrantyLookup";
import RepairTracker from "@/components/RepairTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Wrench, Clock, Award, Users, Zap } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: Shield,
      title: "Extended Warranties",
      description: "Comprehensive coverage for all your devices with flexible terms and conditions",
      features: ["24/7 Support", "On-site Repairs", "Replacement Guarantee", "No Hidden Fees"]
    },
    {
      icon: Wrench,
      title: "Professional Repairs",
      description: "Expert technicians providing fast, reliable repair services for all device types",
      features: ["Certified Technicians", "Quality Parts", "Quick Turnaround", "90-Day Guarantee"]
    },
    {
      icon: Clock,
      title: "Preventive Maintenance",
      description: "Scheduled maintenance to keep your devices running at peak performance",
      features: ["Regular Health Checks", "Performance Optimization", "Predictive Analysis", "Cost Savings"]
    }
  ];

  const stats = [
    { icon: Award, value: "99.5%", label: "Customer Satisfaction" },
    { icon: Users, value: "500+", label: "Enterprise Clients" },
    { icon: Zap, value: "24hr", label: "Average Repair Time" },
    { icon: Shield, value: "50K+", label: "Devices Under Warranty" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Warranty & Repair Services
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Comprehensive support for all your ICT hardware needs with professional warranty and repair services
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Lookup Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <WarrantyLookup />
          <RepairTracker />
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Service Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Service Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Our Service Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { step: 1, title: "Submit Request", desc: "Online or phone submission" },
                { step: 2, title: "Initial Assessment", desc: "Quick diagnostic review" },
                { step: 3, title: "Quote Approval", desc: "Transparent pricing provided" },
                { step: 4, title: "Service Delivery", desc: "Professional repair/service" },
                { step: 5, title: "Quality Check", desc: "Testing and validation" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-neutral-600">{item.desc}</p>
                  {index < 4 && (
                    <div className="hidden md:block w-full h-0.5 bg-neutral-200 mt-4 relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-neutral-300 rounded-full"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-primary to-blue-600 text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Immediate Support?</h2>
            <p className="mb-6 opacity-90">
              Our support team is ready to help you with any warranty claims or repair inquiries
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+254700123456"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
              >
                Call Support
              </a>
              <a
                href="mailto:support@skavtech.co.ke"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              >
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
