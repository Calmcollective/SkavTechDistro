import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Headphones, RotateCcw, Wrench, Activity } from "lucide-react";
import type { FleetDevice } from "@shared/schema";

export default function FleetPortal() {
  // In a real app, this would come from user authentication
  const companyId = "CORP-001";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/fleet/${companyId}/stats`],
  });

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: [`/api/fleet/${companyId}`],
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      retired: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isWarrantyExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (statsLoading || devicesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-8 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Fleet Overview */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats?.total || 0}</div>
                <div className="text-sm text-neutral-600">Total Devices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{stats?.active || 0}</div>
                <div className="text-sm text-neutral-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{stats?.maintenance || 0}</div>
                <div className="text-sm text-neutral-600">Maintenance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats?.expired || 0}</div>
                <div className="text-sm text-neutral-600">Expired Warranty</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Device Inventory</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Warranty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices?.map((device: FleetDevice) => (
                    <TableRow key={device.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{device.deviceModel}</div>
                          <div className="text-sm text-neutral-500">{device.deviceId}</div>
                        </div>
                      </TableCell>
                      <TableCell>{device.assignedUser}</TableCell>
                      <TableCell>{getStatusBadge(device.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {device.warrantyExpiry ? (
                            <span className={isWarrantyExpired(device.warrantyExpiry) ? "text-red-600" : "text-green-600"}>
                              {isWarrantyExpired(device.warrantyExpiry) ? "Expired" : "Valid until"}{" "}
                              {new Date(device.warrantyExpiry).toLocaleDateString()}
                            </span>
                          ) : (
                            "No warranty"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Support
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {devices?.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                No devices found for this company.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full">
                <Headphones className="mr-2 h-4 w-4" />
                Request Support
              </Button>
              <Button className="w-full bg-secondary hover:bg-secondary/90">
                <RotateCcw className="mr-2 h-4 w-4" />
                Request Replacement
              </Button>
              <Button className="w-full bg-accent hover:bg-accent/90">
                <Wrench className="mr-2 h-4 w-4" />
                Schedule Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium">Support ticket resolved</div>
                  <div className="text-xs text-neutral-500">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium">Device warranty renewed</div>
                  <div className="text-xs text-neutral-500">1 day ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium">New device deployed</div>
                  <div className="text-xs text-neutral-500">3 days ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fleet Management</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Support Portal</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Warranty System</span>
                <Badge className="bg-green-100 text-green-800">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
