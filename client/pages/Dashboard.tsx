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
      title: "งานค้างส่ง",
      value: "12",
      change: "+3 จากเมื่อวาน",
      trend: "up",
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      title: "เสร็จวันนี้",
      value: "8",
      change: "+2 จากเมื่อวาน",
      trend: "up",
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "กำลังดำเนินการ",
      value: "15",
      change: "ไม่มีการเปลี่ยนแปลง",
      trend: "stable",
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "ช่างที่ใช้งานได้",
      value: "6",
      change: "พร้อมใช้งา��ทั้งหมด",
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
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Welcome back! Here's your maintenance overview</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/qr-scanner" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <QrCode size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">Scan QR</span>
            </div>
          </Link>
          <Link to="/work-orders" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Wrench size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">Work Orders</span>
            </div>
          </Link>
          <Link to="/assets" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">Assets</span>
            </div>
          </Link>
          <Link to="/schedule" className="group">
            <div className="card-elevated rounded-xl p-4 h-24 flex flex-col items-center justify-center space-y-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Calendar size={20} className="sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-medium">Schedule</span>
            </div>
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.title} className="metric-card rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">{metric.title}</h3>
                  <div className={`p-2 rounded-lg ${metric.color === 'text-destructive' ? 'bg-destructive/10' : metric.color === 'text-success' ? 'bg-success/10' : metric.color === 'text-warning' ? 'bg-warning/10' : 'bg-primary/10'}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">{metric.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Work Orders */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Recent Work Orders</h2>
              <Link to="/work-orders">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-3">
            {recentWorkOrders.map((wo, index) => (
              <Link key={wo.id} to={`/work-orders/${wo.id}`}>
                <div className={`group cursor-pointer p-4 rounded-lg border hover:border-primary/50 transition-all duration-200 ${index === 0 ? 'bg-gradient-to-r from-primary/5 to-transparent' : 'hover:bg-muted/30'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm sm:text-base truncate">{wo.title}</h4>
                      <Badge
                        variant={
                          wo.priority === "Critical" ? "destructive" :
                          wo.priority === "High" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {wo.priority}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-muted-foreground">{wo.id} • {wo.assignee}</p>
                      <p className="text-xs text-muted-foreground">Due: {wo.dueDate}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      wo.status === "Overdue" ? "destructive" :
                      wo.status === "In Progress" ? "default" : "secondary"
                    }
                    className="text-xs shrink-0"
                  >
                    {wo.status}
                  </Badge>
                </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
