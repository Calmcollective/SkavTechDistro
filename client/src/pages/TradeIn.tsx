import TradeInForm from "@/components/TradeInForm";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Recycle, DollarSign, Truck, Shield } from "lucide-react";

export default function TradeIn() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Best Market Value",
      description: "Competitive pricing based on current market conditions"
    },
    {
      icon: Truck,
      title: "Free Collection",
      description: "Complimentary pickup service from your location"
    },
    {
      icon: Shield,
      title: "Secure Data Wiping",
      description: "Professional data destruction with certification"
    },
    {
      icon: Recycle,
      title: "Eco-Friendly",
      description: "Responsible recycling and refurbishment practices"
    }
  ];

  const process = [
    {
      step: 1,
      title: "Get Quote",
      description: "Fill in your device details for an instant valuation"
    },
    {
      step: 2,
      title: "Schedule Pickup",
      description: "Choose a convenient time for device collection"
    },
    {
      step: 3,
      title: "Device Inspection",
      description: "Our experts verify the condition and specifications"
    },
    {
      step: 4,
      title: "Get Paid",
      description: "Receive payment once the device passes inspection"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Device Trade-In Program
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Get instant valuations for your old devices and contribute to sustainable technology practices
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Trade With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-neutral-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trade-In Form */}
        <div className="mb-16">
          <TradeInForm />
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {process.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted Devices */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Accepted Devices</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5zm8 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </div>
                <h4 className="font-semibold">Laptops</h4>
                <p className="text-xs text-neutral-600">Business & Consumer</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
                  </svg>
                </div>
                <h4 className="font-semibold">Desktops</h4>
                <p className="text-xs text-neutral-600">Towers & All-in-One</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                  </svg>
                </div>
                <h4 className="font-semibold">Servers</h4>
                <p className="text-xs text-neutral-600">Rack & Tower</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 5H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H3V7h18v10z"/>
                  </svg>
                </div>
                <h4 className="font-semibold">Tablets</h4>
                <p className="text-xs text-neutral-600">Business Tablets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
