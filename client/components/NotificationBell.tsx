import { useState } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { useInventory } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "urgent" | "warning" | "info" | "success";
  timestamp: string;
  read: boolean;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "งานบำรุงรักษาล่าช้า",
      message: "มีงานบำรุงรักษา 3 งานที่ล่าช้าแล้ว",
      type: "urgent",
      timestamp: "5 นาทีที่แล้ว",
      read: false,
    },
    {
      id: "2",
      title: "อะไหล่ใกล้หมด",
      message: "แบตเตอรี่ 12V เหลือ 2 ชิ้น",
      type: "warning",
      timestamp: "15 นาทีที่แล้ว",
      read: false,
    },
    {
      id: "3",
      title: "งานเสร็จสิ้น",
      message: "งานซ่อมปั๊มน้ำ #001 เสร็จสิ้นแล้ว",
      type: "success",
      timestamp: "1 ชั่วโมงที่แล้ว",
      read: true,
    },
    {
      id: "4",
      title: "การบำรุงรักษาตามกำหนด",
      message: "PM Generator G-001 กำหนดวันพรุ่งนี้",
      type: "info",
      timestamp: "2 ชั่วโมงที่แล้ว",
      read: false,
    },
  ]);

  const { metrics } = useSupabaseData();
  const { criticalAlertsCount } = useInventory();

  // Calculate total unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalAlerts =
    metrics.overdueWorkOrders + metrics.pendingWorkOrders + criticalAlertsCount;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "info":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "urgent":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/30";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30";
      case "success":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/30";
      case "info":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30";
      default:
        return "border-l-gray-300";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-primary/10 rounded-lg transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
          {unreadCount + totalAlerts > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
            >
              {unreadCount + totalAlerts > 99
                ? "99+"
                : unreadCount + totalAlerts}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 shadow-xl border-0 bg-white/95 backdrop-blur-sm"
        align="end"
        sideOffset={5}
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                การแจ้งเตือน
              </CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-7 px-2"
                  >
                    อ่านทั้งหมด
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                คุณมีการแจ้งเตือนใหม่ {unreadCount} รายการ
              </p>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {notifications.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 p-3 pt-0">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm",
                        getNotificationColor(notification.type),
                        !notification.read && "shadow-sm",
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={cn(
                                "text-sm font-medium",
                                !notification.read && "font-semibold",
                              )}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-sm font-medium mb-2">ไม่มีการแจ้งเตือน</h3>
                <p className="text-xs text-muted-foreground">
                  การแจ้งเตือนทั้งหมดจะแสดงที่นี่
                </p>
              </div>
            )}

            {notifications.length > 0 && (
              <div className="border-t p-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={() => {
                      setIsOpen(false);
                      // Navigate to notifications page
                    }}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    ตั้งค่า
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8"
                    onClick={clearAllNotifications}
                  >
                    <X className="h-3 w-3 mr-1" />
                    ลบทั้งหมด
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
