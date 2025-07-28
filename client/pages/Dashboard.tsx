import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  QrCode,
  Activity,
  Settings,
  Package,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Plus,
  BarChart3,
  Calendar,
  Users,
  ArrowRight,
  Zap,
  Shield,
  Bell,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Database,
  Smartphone,
  Wifi,
  WifiOff,
  ClipboardList
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { useInventory } from "@/hooks/use-inventory";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface Metric {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "stable";
  icon: any;
  color: string;
  percentage?: number;
  description?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  color: string;
  href: string;
  badge?: string;
}

export function Dashboard() {
  const {
    metrics,
    recentWorkOrders,
    criticalAlerts,
    unreadNotificationsCount,
    loading,
    error,
    refresh
  } = useSupabaseData();

  const {
    criticalAlertsCount,
    partsNeedingReorder,
    dashboardData
  } = useInventory();

  const { user, userProfile } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced metrics with modern design
  const enhancedMetrics: Metric[] = [
    {
      title: "ใบสั่งงานวันนี้",
      value: metrics.totalWorkOrders || 0,
      change: metrics.completedWorkOrders ? `${metrics.completedWorkOrders} เสร็จแล้ว` : "0 เสร็จแล้ว",
      trend: "up",
      icon: ClipboardList,
      color: "from-blue-500 to-blue-600",
      percentage: metrics.totalWorkOrders ? Math.round((metrics.completedWorkOrders / metrics.totalWorkOrders) * 100) : 0,
      description: "งานบำรุงรักษาทั้งหมด"
    },
    {
      title: "อุปกรณ์ใช้งานได้",
      value: `${metrics.totalAssets - metrics.faultyAssets || 0}/${metrics.totalAssets || 0}`,
      change: metrics.faultyAssets ? `${metrics.faultyAssets} ชำรุด` : "ทั้งหมดปกติ",
      trend: metrics.faultyAssets > 0 ? "down" : "up",
      icon: Settings,
      color: "from-green-500 to-emerald-600",
      percentage: metrics.totalAssets ? Math.round(((metrics.totalAssets - metrics.faultyAssets) / metrics.totalAssets) * 100) : 100,
      description: "สถานะการทำงาน"
    },
    {
      title: "คลังอะไหล่",
      value: metrics.lowStockParts || 0,
      change: metrics.outOfStockParts > 0 ? `${metrics.outOfStockParts} หมดสต็อก` : "สต็อกเพียงพอ",
      trend: metrics.lowStockParts > 0 ? "down" : "stable",
      icon: Package,
      color: "from-orange-500 to-orange-600",
      percentage: metrics.totalParts > 0 ? Math.round(((metrics.totalParts - metrics.lowStockParts) / metrics.totalParts) * 100) : 100,
      description: "รายการเตือนสต็อก"
    },
    {
      title: "ประสิทธิภาพ",
      value: "94.2%",
      change: "+2.1% จากเมื่อวาน",
      trend: "up",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      percentage: 94,
      description: "Overall Equipment Effectiveness"
    }
  ];

  // Quick actions with modern icons
  const quickActions: QuickAction[] = [
    {
      title: "สร้างใบสั่งงาน",
      description: "เพิ่มงานบำรุงรักษาใหม่",
      icon: Plus,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      href: "/work-orders/new",
    },
    {
      title: "สแกน QR Code",
      description: "สแกนอุปกรณ์เพื่อดูข้อมูล",
      icon: QrCode,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      href: "/qr-scanner",
    },
    {
      title: "ตรวจสอบสต็อก",
      description: "��ัดการคลังอะไหล่",
      icon: Package,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      href: "/parts",
      badge: metrics.lowStockParts > 0 ? String(metrics.lowStockParts) : undefined
    },
    {
      title: "รายงานสถิติ",
      description: "ดูประสิทธิภาพระบบ",
      icon: BarChart3,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      href: "/reports",
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          className="flex flex-col space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                สวัสดี, {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ผู้ใช้งาน'}! 👋
              </h1>
              {userProfile && (
                <p className="text-sm text-slate-500 mt-1">
                  {userProfile.role} | {userProfile.department} | {userProfile.employee_code}
                </p>
              )}
              <p className="text-slate-600 mt-2 flex items-center gap-2">
                วันนี้ {currentTime.toLocaleDateString('th-TH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                <span className="mx-2">•</span>
                <div className="flex items-center gap-1">
                  {isOnline ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">ออนไลน์</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">ออฟไลน์</span>
                    </>
                  )}
                </div>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="border-slate-200 hover:border-slate-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                รีเฟรช
              </Button>
              <Link to="/notifications">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {(unreadNotificationsCount > 0) && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>

          {/* System Status Banner */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <Alert className={`border-0 ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={isOnline ? 'text-green-800' : 'text-red-800'}>
                  {isOnline 
                    ? 'ระบบทำงานปกติ - ข้อมูลซิงค์แบบเรียลไทม์' 
                    : 'ทำงานในโหมดออฟไลน์ - ข้อมูลจะซิงค์เมื่อกลับมาออนไลน์'
                  }
                </AlertDescription>
              </div>
            </Alert>
          </motion.div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {enhancedMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group"
            >
              <Card className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                          <metric.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                          <p className="text-xs text-slate-500">{metric.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
                          <div className="flex items-center gap-1">
                            {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                            {metric.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                            <span className={`text-xs font-medium ${
                              metric.trend === "up" ? "text-green-600" : 
                              metric.trend === "down" ? "text-red-600" : "text-slate-500"
                            }`}>
                              {metric.change}
                            </span>
                          </div>
                        </div>
                        
                        {metric.percentage !== undefined && (
                          <div className="space-y-1">
                            <Progress 
                              value={metric.percentage} 
                              className="h-2 bg-slate-100"
                            />
                            <p className="text-xs text-slate-500">{metric.percentage}% ประสิทธิภาพ</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <Zap className="h-5 w-5 text-blue-500" />
                การดำเนินการด่วน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to={action.href}>
                      <Card className="relative overflow-hidden border-0 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white to-slate-50">
                        <CardContent className="p-6 text-center">
                          <div className="relative inline-flex">
                            <div className={`p-4 rounded-2xl ${action.color} shadow-lg group-hover:shadow-xl transition-all`}>
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            {action.badge && (
                              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {action.description}
                          </p>
                          <ArrowRight className="h-4 w-4 mx-auto mt-3 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Work Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <Activity className="h-5 w-5 text-green-500" />
                    งานล่าสุด
                  </CardTitle>
                  <Link to="/work-orders">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      ดูทั้งหมด
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentWorkOrders?.slice(0, 5).map((workOrder: any, index: number) => (
                    <motion.div
                      key={workOrder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group cursor-pointer"
                    >
                      <Link to={`/work-orders/${workOrder.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                              {workOrder.title}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {workOrder.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant={workOrder.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                {workOrder.priority === 'high' ? 'สูง' : workOrder.priority === 'medium' ? 'กลาง' : 'ต่ำ'}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {new Date(workOrder.created_at).toLocaleDateString('th-TH')}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    </motion.div>
                  )) || (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">ไม่มีใบสั่งงานล่าสุด</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Critical Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    การแจ้งเตือนสำคัญ
                  </CardTitle>
                  <Link to="/notifications">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      ดูทั้งหมด
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalAlerts?.slice(0, 5).map((alert: any, index: number) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="p-4 rounded-lg border-l-4 border-red-400 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900">{alert.title}</h4>
                          <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                          <span className="text-xs text-red-600 mt-2 block">
                            {new Date(alert.created_at).toLocaleString('th-TH')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )) || (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">ไม่มีการแจ้งเตือนสำคัญ</p>
                      <p className="text-xs text-slate-400 mt-1">ระบบทำงานปกติ</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={refresh}
                    className="ml-2 text-red-700 hover:text-red-800"
                  >
                    ลองใหม่
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
