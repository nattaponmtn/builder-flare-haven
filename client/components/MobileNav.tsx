import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Settings,
  QrCode,
  Menu,
  X,
  Calendar,
  BarChart3,
  Bell,
  Users,
  Download,
  Wrench,
  AlertTriangle,
  Cog,
  Shield,
  LogOut,
  ChevronRight,
  Search,
  User,
  Home,
  Activity,
  Database,
  Zap,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { NotificationSystem } from "./inventory/NotificationSystem";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { useInventory } from "@/hooks/use-inventory";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "./NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  {
    path: "/dashboard",
    label: "แดชบอร์ด",
    icon: LayoutDashboard,
    category: "main",
  },
  {
    path: "/work-orders",
    label: "ใบสั่งงาน",
    icon: ClipboardList,
    category: "work",
  },
  {
    path: "/preventive-maintenance",
    label: "PM System",
    icon: Shield,
    category: "work",
  },
  { path: "/assets", label: "อุปกรณ์", icon: Wrench, category: "assets" },
  { path: "/parts", label: "คลังอะไหล่", icon: Package, category: "assets" },
  {
    path: "/inventory",
    label: "จัดการสต็อก",
    icon: Database,
    category: "assets",
  },
  {
    path: "/schedule",
    label: "ตารางงาน",
    icon: Calendar,
    category: "planning",
  },
  { path: "/reports", label: "รายงาน", icon: BarChart3, category: "planning" },
  {
    path: "/notifications",
    label: "การแจ้งเตือน",
    icon: Bell,
    category: "system",
  },
  { path: "/users", label: "ผู้ใ��้งาน", icon: Users, category: "system" },
  { path: "/settings", label: "ตั้งค่า", icon: Settings, category: "system" },
  { path: "/qr-scanner", label: "สแกน QR", icon: QrCode, category: "tools" },
  {
    path: "/pm-qr-scanner",
    label: "PM Scanner",
    icon: QrCode,
    category: "tools",
  },
];

const categoryLabels = {
  main: "หลัก",
  work: "งานบำรุงรักษา",
  assets: "ทรัพย์สิน",
  planning: "วางแผน",
  system: "ระบบ",
  tools: "เครื่องมือ",
};

export function MobileNav() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { metrics, criticalAlerts } = useSupabaseData();
  const { criticalAlertsCount } = useInventory();
  const { signOut, user } = useAuth();

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Calculate notification counts
  const notificationCounts = {
    workOrders:
      (metrics.overdueWorkOrders || 0) + (metrics.pendingWorkOrders || 0),
    assets: metrics.faultyAssets || 0,
    parts: (metrics.lowStockParts || 0) + (metrics.outOfStockParts || 0),
    alerts: criticalAlertsCount || 0,
  };

  const getNotificationCount = (path: string) => {
    switch (path) {
      case "/work-orders":
        return notificationCounts.workOrders;
      case "/assets":
        return notificationCounts.assets;
      case "/parts":
      case "/inventory":
        return notificationCounts.parts;
      case "/notifications":
        return notificationCounts.alerts;
      default:
        return 0;
    }
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email || "User";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const totalNotifications = Object.values(notificationCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  // Group nav items by category
  const groupedNavItems = navItems.reduce(
    (groups: Record<string, typeof navItems>, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
      return groups;
    },
    {},
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 p-4 flex items-center justify-between md:hidden sticky top-0 z-40 shadow-sm">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Cog
                className="w-5 h-5 text-white animate-spin"
                style={{ animationDuration: "3s" }}
              />
            </div>
            <div className="absolute inset-0 bg-blue-400/30 rounded-xl blur-lg"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CMMS Pro
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Maintenance System</span>
              <div className="flex items-center gap-1">
                {isOnline ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? (
                <X size={22} className="text-slate-600" />
              ) : (
                <Menu size={22} className="text-slate-600" />
              )}
            </motion.div>
            {totalNotifications > 0 && !isMenuOpen && (
              <motion.span
                className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            )}
          </motion.button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-80 bg-white/98 backdrop-blur-xl border-r border-slate-200/50 z-50 md:hidden shadow-2xl overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Cog
                      className="w-6 h-6 text-white animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-blue-400/30 rounded-xl blur-lg"></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    CMMS Mobile Pro
                  </h2>
                  <p className="text-sm text-slate-500">Maintenance System</p>
                </div>
              </div>

              {/* User Profile */}
              <motion.div
                className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {user?.user_metadata?.full_name ||
                        user?.email?.split("@")[0] ||
                        "ผู้ใช้ง��น"}
                    </h3>
                    <p className="text-sm text-slate-600">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-red-400"}`}
                      />
                      <span className="text-xs text-slate-500">
                        {isOnline ? "ออนไลน์" : "ออฟไลน์"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation Menu */}
              <div className="space-y-6">
                {Object.entries(groupedNavItems).map(
                  ([category, items], categoryIndex) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + categoryIndex * 0.05 }}
                    >
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        {
                          categoryLabels[
                            category as keyof typeof categoryLabels
                          ]
                        }
                      </h4>
                      <div className="space-y-1">
                        {items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          const notificationCount = getNotificationCount(
                            item.path,
                          );

                          return (
                            <motion.div
                              key={item.path}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay:
                                  0.1 + categoryIndex * 0.05 + itemIndex * 0.02,
                              }}
                            >
                              <Link
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                  "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                                  isActive
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                    : "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
                                )}
                              >
                                <div
                                  className={cn(
                                    "p-2 rounded-lg transition-all",
                                    isActive
                                      ? "bg-white/20"
                                      : "bg-slate-200 group-hover:bg-slate-300",
                                  )}
                                >
                                  <Icon
                                    size={18}
                                    className={
                                      isActive ? "text-white" : "text-slate-600"
                                    }
                                  />
                                </div>

                                <div className="flex-1">
                                  <span className="font-medium text-sm">
                                    {item.label}
                                  </span>
                                  {notificationCount > 0 && (
                                    <Badge
                                      variant={
                                        isActive ? "secondary" : "destructive"
                                      }
                                      className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                    >
                                      {notificationCount > 9
                                        ? "9+"
                                        : notificationCount}
                                    </Badge>
                                  )}
                                </div>

                                <ChevronRight
                                  size={16}
                                  className={cn(
                                    "transition-transform group-hover:translate-x-1",
                                    isActive ? "text-white" : "text-slate-400",
                                  )}
                                />

                                {isActive && (
                                  <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-600/20"
                                    layoutId="activeBackground"
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 30,
                                    }}
                                  />
                                )}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ),
                )}
              </div>

              {/* Logout Button */}
              <motion.div
                className="pt-6 mt-8 border-t border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="w-full justify-start gap-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 group"
                >
                  <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-all">
                    <LogOut size={18} className="text-red-600" />
                  </div>
                  <span className="font-medium text-sm">ออกจากระบบ</span>
                  <ChevronRight
                    size={16}
                    className="ml-auto text-red-400 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </motion.div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white/98 backdrop-blur-xl border-r border-slate-200/50 shadow-sm">
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Desktop Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Cog
                  className="w-6 h-6 text-white animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
              <div className="absolute inset-0 bg-blue-400/30 rounded-xl blur-lg"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CMMS Pro
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  Maintenance System
                </span>
                <NotificationSystem />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="space-y-6">
            {Object.entries(groupedNavItems).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h4>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    const notificationCount = getNotificationCount(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                            : "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            isActive
                              ? "bg-white/20"
                              : "bg-slate-200 group-hover:bg-slate-300",
                          )}
                        >
                          <Icon
                            size={18}
                            className={
                              isActive ? "text-white" : "text-slate-600"
                            }
                          />
                        </div>

                        <div className="flex-1">
                          <span className="font-medium text-sm">
                            {item.label}
                          </span>
                          {notificationCount > 0 && (
                            <Badge
                              variant={isActive ? "secondary" : "destructive"}
                              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                            >
                              {notificationCount > 9 ? "9+" : notificationCount}
                            </Badge>
                          )}
                        </div>

                        <ChevronRight
                          size={16}
                          className={cn(
                            "transition-transform group-hover:translate-x-1",
                            isActive ? "text-white" : "text-slate-400",
                          )}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Logout */}
          <div className="pt-6 mt-8 border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start gap-3 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 group"
            >
              <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-all">
                <LogOut size={18} className="text-red-600" />
              </div>
              <span className="font-medium text-sm">ออกจากระบบ</span>
              <ChevronRight
                size={16}
                className="ml-auto text-red-400 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/50 p-2 md:hidden z-30 shadow-lg">
        <div className="flex justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const notificationCount = getNotificationCount(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1 relative",
                  isActive
                    ? "text-blue-600 bg-blue-50 scale-105"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                )}
              >
                <div className="relative">
                  <Icon size={20} />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs mt-1 truncate font-medium">
                  {item.label.split(" ")[0]}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-600 rounded-full"
                    layoutId="bottomActiveIndicator"
                    style={{ x: "-50%" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
