import AdminDashboard from "@/components/AdminDashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Upload, FileText, Settings } from "lucide-react";

export default function Admin() {
  const quickActions = [
    {
      icon: Upload,
      title: "Bulk Device Upload",
      description: "Import devices via CSV file",
      action: "Upload CSV",
      color: "bg-blue-500"
    },
    {
      icon: FileText,
      title: "Generate Reports",
      description: "Create performance and inventory reports",
      action: "Create Report",
      color: "bg-green-500"
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Configure system preferences",
      action: "Open Settings",
      color: "bg-purple-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "View detailed performance metrics",
      action: "View Analytics",
      color: "bg-orange-500"
    }
  ];

  const recentActivity = [
    { time: "2 minutes ago", action: "Device DL7420-2024-001 status updated to 'Ready'", user: "John Smith" },
    { time: "15 minutes ago", action: "New repair ticket created: RPR-2024-045", user: "System" },
    { time: "32 minutes ago", action: "Quality check completed for HP850-2024-012", user: "Sarah Johnson" },
    { time: "1 hour ago", action: "Bulk import of 25 devices completed", user: "Mike Chen" },
    { time: "2 hours ago", action: "Customer trade-in valuation approved", user: "Admin" }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">
                Refurbishment Dashboard
              </h1>
              <p className="text-neutral-600">
                Manage devices through refurbishment stages with real-time tracking and analytics
              </p>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-600">
              System Online
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-neutral-600 mb-4">{action.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  {action.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-3">
            <AdminDashboard />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4">
                      <div className="text-sm font-medium text-neutral-900 mb-1">
                        {activity.action}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {activity.time} • {activity.user}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Services</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Background Jobs</span>
                    <Badge className="bg-green-100 text-green-800">Running</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage</span>
                    <Badge className="bg-yellow-100 text-yellow-800">78% Used</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Devices Processed</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Quality Checks</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Repairs Completed</span>
                    <span className="font-semibold">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-600">Ready for Sale</span>
                    <span className="font-semibold">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
