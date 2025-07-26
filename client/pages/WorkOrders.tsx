import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar
} from "lucide-react";
import { useState } from "react";

const workOrders = [
  {
    id: "WO-2024-001",
    title: "Tractor Engine Maintenance",
    description: "Routine maintenance check for CAT 320D excavator",
    status: "In Progress",
    priority: "High",
    assignee: "John Doe",
    asset: "CAT-320D-001",
    location: "Field A",
    dueDate: "2024-01-15",
    estimatedHours: 4,
    type: "Preventive"
  },
  {
    id: "WO-2024-002",
    title: "Irrigation System Check",
    description: "Weekly inspection of irrigation pumps and valves",
    status: "Pending",
    priority: "Medium",
    assignee: "Jane Smith",
    asset: "PUMP-IR-001",
    location: "Irrigation Hub",
    dueDate: "2024-01-16",
    estimatedHours: 2,
    type: "Preventive"
  },
  {
    id: "WO-2024-003",
    title: "Harvester Belt Replacement",
    description: "Replace worn conveyor belt on harvester",
    status: "Overdue",
    priority: "Critical",
    assignee: "Mike Johnson",
    asset: "HARV-001",
    location: "Maintenance Shop",
    dueDate: "2024-01-14",
    estimatedHours: 6,
    type: "Corrective"
  },
  {
    id: "WO-2024-004",
    title: "Fertilizer Spreader Calibration",
    description: "Annual calibration of fertilizer spreading equipment",
    status: "Completed",
    priority: "Low",
    assignee: "Sarah Wilson",
    asset: "FERT-SPR-001",
    location: "Equipment Bay",
    dueDate: "2024-01-13",
    estimatedHours: 3,
    type: "Preventive"
  }
];

export function WorkOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Overdue":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default" as const;
      case "In Progress":
        return "secondary" as const;
      case "Overdue":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive" as const;
      case "High":
        return "default" as const;
      case "Medium":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="p-4 pb-20 md:pb-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Manage and track maintenance tasks</p>
        </div>
        <Button className="sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search work orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {filteredWorkOrders.map((wo) => (
          <Card key={wo.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(wo.status)}
                      <h3 className="font-semibold">{wo.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{wo.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityVariant(wo.priority)}>
                      {wo.priority}
                    </Badge>
                    <Badge variant={getStatusVariant(wo.status)}>
                      {wo.status}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">{wo.description}</p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{wo.assignee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{wo.dueDate}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Asset: <span className="font-medium text-foreground">{wo.asset}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Location: <span className="font-medium text-foreground">{wo.location}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    {wo.type} • Est. {wo.estimatedHours}h
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No work orders found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
