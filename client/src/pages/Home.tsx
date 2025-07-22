import Hero from "@/components/Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Shield, 
  Recycle, 
  Building, 
  Wrench, 
  BarChart3, 
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Zap,
  Globe
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: BarChart3,
      title: "Refurbishment Dashboard",
      description: "Track devices through stages with visual KPIs and real-time status updates",
      link: "/admin",
      color: "text-blue-600"
    },
    {
      icon: Recycle,
      title: "Customer Trade-In Tool",
      description: "Get instant valuations and schedule pickup with WhatsApp integration",
      link: "/trade-in",
      color: "text-green-600"
    },
    {
      icon: Shield,
      title: "Warranty & Repair Tracker",
      description: "View warranty status and track repair stages with real-time updates",
      link: "/services",
      color: "text-purple-600"
    },
    {
      icon: Building,
      title: "Corporate Fleet Portal",
      description: "Enterprise device management with audit logs and bulk operations",
      link: "/fleet",
      color: "text-indigo-600"
    },
    {
      icon: MessageSquare,
      title: "AI Support Chatbot",
      description: "Smart assistance for purchases, repairs, and technical support",
      link: "#",
      color: "text-orange-600"
    },
    {
      icon: Wrench,
      title: "Professional Services",
      description: "Expert refurbishment, repair, and maintenance services",
      link: "/services",
      color: "text-red-600"
    }
  ];

  const benefits = [
    {
      icon: CheckCircle,
      title: "Quality Guaranteed",
      description: "All refurbished devices undergo rigorous testing and come with warranty"
    },
    {
      icon: Zap,
      title: "Fast Turnaround",
      description: "Quick processing times for repairs, trade-ins, and device deployments"
    },
    {
      icon: Globe,
      title: "Sustainable Solutions",
      description: "Eco-friendly practices with professional recycling and refurbishment"
    }
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Complete ICT Hardware Management
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Six integrated modules designed to streamline your hardware lifecycle from acquisition to disposal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center mb-4 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 mb-6">{feature.description}</p>
                  <Link href={feature.link}>
                    <Button variant="outline" className="group w-full">
                      Explore Feature
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose Skavtech?
            </h2>
            <p className="text-xl text-neutral-600">
              Professional ICT services you can trust
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                <p className="text-neutral-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your ICT Operations?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of businesses already using Skavtech for their hardware needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="bg-white text-primary hover:bg-neutral-100">
                Browse Products
              </Button>
            </Link>
            <Link href="/fleet">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                Enterprise Solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
