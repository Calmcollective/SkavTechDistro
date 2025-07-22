import FleetPortal from "@/components/FleetPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Shield, BarChart3, Bell, Calendar } from "lucide-react";

export default function Fleet() {
  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards with device performance metrics and usage analytics"
    },
    {
      icon: Shield,
      title: "Warranty Management",
      description: "Centralized warranty tracking with automated renewal notifications"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Assign and track devices across your organization with user profiles"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Proactive notifications for maintenance, warranty expiration, and issues"
    },
    {
      icon: Calendar,
      title: "Maintenance Scheduling",
      description: "Automated maintenance scheduling to prevent downtime and extend device life"
    },
    {
      icon: Building,
      title: "Multi-location Support",
      description: "Manage devices across multiple offices and locations from a single portal"
    }
  ];

  const benefits = [
    { metric: "40%", label: "Reduction in IT Costs" },
    { metric: "99.9%", label: "System Uptime" },
    { metric: "24/7", label: "Support Availability" },
    { metric: "50+", label: "Enterprise Clients" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Corporate Fleet Portal
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Enterprise device management platform for comprehensive fleet oversight and control
          </p>
        </div>

        {/* Benefits Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary mb-2">{benefit.metric}</div>
                <div className="text-sm text-neutral-600">{benefit.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Fleet Portal */}
        <FleetPortal />

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Enterprise Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Section */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Enterprise Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Active Directory</h3>
                <p className="text-sm text-neutral-600">Seamless integration with existing IT infrastructure</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Business Intelligence</h3>
                <p className="text-sm text-neutral-600">Advanced reporting and analytics for decision making</p>
              </div>
              
              <div>
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Security Compliance</h3>
                <p className="text-sm text-neutral-600">Enterprise-grade security with compliance reporting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="mt-16 bg-gradient-to-r from-primary to-blue-600 text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Fleet Management?</h2>
            <p className="mb-8 opacity-90 max-w-2xl mx-auto">
              Join the growing number of enterprises using Skavtech's fleet management solution to optimize their IT operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-neutral-100">
                Request Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
