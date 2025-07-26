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
import { Link } from "react-router-dom";

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
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Work Orders</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage and track maintenance tasks</p>
          </div>
          <Button className="sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Work Order
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="card-elevated rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-0 shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-background/50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-background/50 border rounded-md text-sm shadow-sm"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Work Orders List */}
        <div className="space-y-3">
          {filteredWorkOrders.map((wo, index) => (
            <div key={wo.id} className={`card-elevated rounded-xl overflow-hidden cursor-pointer ${wo.status === 'Overdue' ? 'ring-2 ring-destructive/20' : ''} ${wo.priority === 'Critical' ? 'border-l-4 border-l-destructive' : wo.priority === 'High' ? 'border-l-4 border-l-warning' : ''}`}>
              <div className="p-4 sm:p-5">
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(wo.status)}
                        <h3 className="font-semibold text-sm sm:text-base truncate">{wo.title}</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{wo.id}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Badge variant={getPriorityVariant(wo.priority)} className="text-xs">
                        {wo.priority}
                      </Badge>
                      <Badge variant={getStatusVariant(wo.status)} className="text-xs">
                        {wo.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{wo.description}</p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{wo.assignee}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{wo.dueDate}</span>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Asset:</span> <span className="font-medium">{wo.asset}</span>
                    </div>
                    <div className="p-2 bg-muted/30 rounded-lg">
                      <span className="text-muted-foreground">Location:</span> <span className="font-medium">{wo.location}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {wo.type} • Est. {wo.estimatedHours}h
                    </div>
                    <Link to={`/work-orders/${wo.id}`}>
                    <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                      View Details
                    </Button>
                  </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWorkOrders.length === 0 && (
          <div className="card-elevated rounded-xl">
            <div className="text-center py-12 px-4">
              <p className="text-muted-foreground">No work orders found matching your criteria.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
