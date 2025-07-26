import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Wrench,
  QrCode,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const metrics = [
    {
      title: "Overdue Tasks",
      value: "12",
      change: "+3 from yesterday",
      trend: "up",
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      title: "Completed Today",
      value: "8",
      change: "+2 from yesterday",
      trend: "up",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "In Progress",
      value: "15",
      change: "No change",
      trend: "stable",
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Active Technicians",
      value: "6",
      change: "All available",
      trend: "stable",
      icon: Users,
      color: "text-primary"
    }
  ];

  const recentWorkOrders = [
    {
      id: "WO-2024-001",
      title: "Tractor Engine Maintenance",
      status: "In Progress",
      priority: "High",
      assignee: "John Doe",
      dueDate: "2024-01-15"
    },
    {
      id: "WO-2024-002", 
      title: "Irrigation System Check",
      status: "Pending",
      priority: "Medium",
      assignee: "Jane Smith",
      dueDate: "2024-01-16"
    },
    {
      id: "WO-2024-003",
      title: "Harvester Belt Replacement",
      status: "Overdue",
      priority: "Critical",
      assignee: "Mike Johnson",
      dueDate: "2024-01-14"
    }
  ];

  return (
    <div className="p-4 pb-20 md:pb-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your maintenance overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/qr-scanner">
          <Button className="w-full h-20 flex-col space-y-2" variant="outline">
            <QrCode size={24} />
            <span className="text-sm">Scan QR</span>
          </Button>
        </Link>
        <Link to="/work-orders">
          <Button className="w-full h-20 flex-col space-y-2" variant="outline">
            <Wrench size={24} />
            <span className="text-sm">Work Orders</span>
          </Button>
        </Link>
        <Link to="/assets">
          <Button className="w-full h-20 flex-col space-y-2" variant="outline">
            <TrendingUp size={24} />
            <span className="text-sm">Assets</span>
          </Button>
        </Link>
        <Link to="/schedule">
          <Button className="w-full h-20 flex-col space-y-2" variant="outline">
            <Calendar size={24} />
            <span className="text-sm">Schedule</span>
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Work Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Work Orders</CardTitle>
          <Link to="/work-orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentWorkOrders.map((wo) => (
            <div key={wo.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{wo.title}</h4>
                  <Badge 
                    variant={
                      wo.priority === "Critical" ? "destructive" :
                      wo.priority === "High" ? "default" : "secondary"
                    }
                  >
                    {wo.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{wo.id} • {wo.assignee}</p>
                <p className="text-xs text-muted-foreground">Due: {wo.dueDate}</p>
              </div>
              <Badge 
                variant={
                  wo.status === "Overdue" ? "destructive" :
                  wo.status === "In Progress" ? "default" : "secondary"
                }
              >
                {wo.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
