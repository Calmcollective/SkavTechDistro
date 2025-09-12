import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Inbox, Wrench, Search, CheckCircle, Plus, Download } from "lucide-react";
import type { Device } from "../../../shared/schema";

interface DashboardStats {
  received: number;
  in_repair: number;
  qc: number;
  ready: number;
}

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [technicianFilter, setTechnicianFilter] = useState<string>("");

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ["/api/admin/devices", statusFilter, technicianFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (technicianFilter) params.append("technician", technicianFilter);
      
      const response = await fetch(`/api/admin/devices?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch devices");
      return response.json();
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      received: "outline",
      diagnosed: "secondary", 
      repaired: "default",
      qc: "secondary",
      ready: "default",
    };

    const colors: Record<string, string> = {
      received: "bg-blue-100 text-blue-800",
      diagnosed: "bg-yellow-100 text-yellow-800", 
      repaired: "bg-orange-100 text-orange-800",
      qc: "bg-purple-100 text-purple-800",
      ready: "bg-green-100 text-green-800",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (statsLoading || devicesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-primary">
                <Inbox className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-neutral-900">
                  {stats?.received || 0}
                </div>
                <div className="text-sm text-neutral-600">Devices Received</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-accent">
                <Wrench className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-neutral-900">
                  {stats?.in_repair || 0}
                </div>
                <div className="text-sm text-neutral-600">In Repair</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-blue-500">
                <Search className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-neutral-900">
                  {stats?.qc || 0}
                </div>
                <div className="text-sm text-neutral-600">Quality Check</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-secondary">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-neutral-900">
                  {stats?.ready || 0}
                </div>
                <div className="text-sm text-neutral-600">Ready for Sale</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Management Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Device Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filters */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="diagnosed">Diagnosed</SelectItem>
                  <SelectItem value="repaired">Repaired</SelectItem>
                  <SelectItem value="qc">Quality Check</SelectItem>
                  <SelectItem value="ready">Ready for Sale</SelectItem>
                </SelectContent>
              </Select>

              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Technicians</SelectItem>
                  <SelectItem value="John Smith">John Smith</SelectItem>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                </SelectContent>
              </Select>

              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Device
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices?.map((device: Device) => (
                  <TableRow key={device.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{device.model}</div>
                        <div className="text-sm text-neutral-500 capitalize">{device.deviceType}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{device.serialNumber}</TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell>{device.assignedTechnician || "Unassigned"}</TableCell>
                    <TableCell>
                      {device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {devices?.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No devices found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
