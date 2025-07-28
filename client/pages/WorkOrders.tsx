import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Wrench,
  User,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  ArrowRight,
  TrendingUp,
  FileText,
  Activity,
  Zap,
  Eye,
  Star,
  BarChart3,
  Settings,
  ChevronDown,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Building,
  CircuitBoard,
  Package,
  Timer,
  DollarSign,
  PlayCircle,
  PauseCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { createTableService } from "../../shared/supabase/database-service";
import { useAuth } from "@/hooks/useAuth";

// Real database interface based on actual schema
interface WorkOrder {
  id: string;
  work_type: string;
  title: string;
  description: string;
  status: string;
  priority: number;
  asset_id: string;
  location_id: string;
  system_id: string;
  pm_template_id: string;
  assigned_to_user_id: string;
  requested_by_user_id: string;
  created_at: string;
  scheduled_date: string;
  completed_at: string;
  wo_number: string;
  estimated_hours: number;
  assigned_to: string;
  requested_by: string;
  total_cost: number;
  labor_cost: number;
  parts_cost: number;
  actual_hours: number;
  updated_at: string;
  company_id: string;
}

interface WorkOrderTask {
  id: string;
  work_order_id: string;
  description: string;
  is_completed: boolean;
  actual_value_text: string;
  actual_value_numeric: number;
  completed_at: string;
  is_critical: boolean;
}

export function WorkOrders() {
  const { workOrders, loading, error, refresh } = useSupabaseData();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workOrderTasks, setWorkOrderTasks] = useState<WorkOrderTask[]>([]);

  // Load work order tasks
  useEffect(() => {
    const loadWorkOrderTasks = async () => {
      if (!workOrders || workOrders.length === 0) return;

      try {
        const tasksService = createTableService("work_order_tasks");
        const workOrderIds = workOrders.map((wo: WorkOrder) => wo.id);

        // Load tasks for all work orders
        const allTasks: WorkOrderTask[] = [];
        for (const woId of workOrderIds) {
          const result = await tasksService.getByField("work_order_id", woId);
          if (result.data) {
            allTasks.push(...(result.data as WorkOrderTask[]));
          }
        }

        setWorkOrderTasks(allTasks);
      } catch (error) {
        console.error("Error loading work order tasks:", error);
      }
    };

    loadWorkOrderTasks();
  }, [workOrders]);

  // Filter and sort work orders
  const filteredWorkOrders = useMemo(() => {
    if (!workOrders) return [];

    let filtered = workOrders.filter((wo: WorkOrder) => {
      const matchesSearch =
        wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.wo_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || wo.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || wo.priority.toString() === priorityFilter;
      const matchesWorkType =
        workTypeFilter === "all" || wo.work_type === workTypeFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesWorkType
      );
    });

    // Sort
    filtered.sort((a: WorkOrder, b: WorkOrder) => {
      let aValue: any = a[sortBy as keyof WorkOrder];
      let bValue: any = b[sortBy as keyof WorkOrder];

      if (
        sortBy === "created_at" ||
        sortBy === "scheduled_date" ||
        sortBy === "completed_at"
      ) {
        aValue = new Date(aValue || "").getTime() || 0;
        bValue = new Date(bValue || "").getTime() || 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    workOrders,
    searchTerm,
    statusFilter,
    priorityFilter,
    workTypeFilter,
    sortBy,
    sortOrder,
  ]);

  // Get status color and thai text
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "รอดำเนินการ":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: Clock,
          text: "รอดำเนินการ",
        };
      case "in_progress":
      case "กำลังดำเนินการ":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: PlayCircle,
          text: "กำลังดำเนินการ",
        };
      case "completed":
      case "เสร็จสิ้น":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          text: "เสร็จสิ้น",
        };
      case "cancelled":
      case "ยกเลิก":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          text: "ยกเลิก",
        };
      case "on_hold":
      case "พักงาน":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: PauseCircle,
          text: "พักงาน",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: FileText,
          text: status,
        };
    }
  };

  // Get priority color and text
  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: Zap,
          text: "ต่ำ",
        };
      case 2:
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertTriangle,
          text: "ปานกลาง",
        };
      case 3:
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: AlertTriangle,
          text: "สูง",
        };
      case 4:
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: AlertTriangle,
          text: "วิกฤติ",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: FileText,
          text: "ไม่ระบุ",
        };
    }
  };

  // Get work type info
  const getWorkTypeInfo = (workType: string) => {
    switch (workType.toLowerCase()) {
      case "preventive":
      case "pm":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Settings,
          text: "บำรุงรักษาเชิงป้องกัน",
        };
      case "corrective":
      case "repair":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: Wrench,
          text: "แก้ไขเมื่อเสีย",
        };
      case "inspection":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Eye,
          text: "ตรวจสอบ",
        };
      case "emergency":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: AlertTriangle,
          text: "ฉุกเฉิน",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: FileText,
          text: workType || "ไม่ระบุ",
        };
    }
  };

  // Calculate task completion for work order
  const getTaskCompletion = (workOrderId: string) => {
    const tasks = workOrderTasks.filter(
      (task) => task.work_order_id === workOrderId,
    );
    if (tasks.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completed = tasks.filter((task) => task.is_completed).length;
    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100),
    };
  };

  // Handle delete work order
  const handleDeleteWorkOrder = async () => {
    if (!selectedWorkOrder) return;

    try {
      const workOrderService = createTableService("work_orders");
      await workOrderService.delete(selectedWorkOrder);

      toast({
        title: "สำเร็จ",
        description: "ลบใบสั่งงานเรียบร้อยแล้ว",
      });
      setShowDeleteDialog(false);
      setSelectedWorkOrder(null);
      refresh();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบใบสั่งงานได้",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!workOrders)
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        avgCompletion: 0,
      };

    const total = workOrders.length;
    const pending = workOrders.filter(
      (wo: WorkOrder) => wo.status === "pending" || wo.status === "รอดำเนินการ",
    ).length;
    const inProgress = workOrders.filter(
      (wo: WorkOrder) =>
        wo.status === "in_progress" || wo.status === "กำลังดำเนินการ",
    ).length;
    const completed = workOrders.filter(
      (wo: WorkOrder) => wo.status === "completed" || wo.status === "เสร็จสิ้น",
    ).length;
    const overdue = workOrders.filter(
      (wo: WorkOrder) =>
        wo.scheduled_date &&
        new Date(wo.scheduled_date) < new Date() &&
        wo.status !== "completed" &&
        wo.status !== "เสร็จสิ้น",
    ).length;

    // Calculate average task completion
    let totalCompletion = 0;
    let workOrdersWithTasks = 0;
    workOrders.forEach((wo: WorkOrder) => {
      const taskInfo = getTaskCompletion(wo.id);
      if (taskInfo.total > 0) {
        totalCompletion += taskInfo.percentage;
        workOrdersWithTasks++;
      }
    });
    const avgCompletion =
      workOrdersWithTasks > 0
        ? Math.round(totalCompletion / workOrdersWithTasks)
        : 0;

    return { total, pending, inProgress, completed, overdue, avgCompletion };
  }, [workOrders, workOrderTasks]);

  // Get unique work types for filter
  const workTypes = useMemo(() => {
    if (!workOrders) return [];
    const types = [...new Set(workOrders.map((wo: WorkOrder) => wo.work_type))];
    return types.filter(Boolean);
  }, [workOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
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
        {/* Header */}
        <motion.div
          className="flex flex-col space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                ใบสั่งงาน
              </h1>
              <p className="text-slate-600 mt-2">
                จัดการและติดตามงานบำรุงรักษาทั้งหมด
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                className="border-slate-200 hover:border-slate-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                ���ีเฟรช
              </Button>
              <Link to="/work-orders/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  สร้างใบสั่งงาน
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </span>
              </div>
              <p className="text-sm text-slate-600">ทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-900">
                  {stats.pending}
                </span>
              </div>
              <p className="text-sm text-slate-600">รออนุมัติ</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">
                  {stats.inProgress}
                </span>
              </div>
              <p className="text-sm text-slate-600">ดำเนินการ</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-900">
                  {stats.completed}
                </span>
              </div>
              <p className="text-sm text-slate-600">เสร็จสิ้น</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-red-900">
                  {stats.overdue}
                </span>
              </div>
              <p className="text-sm text-slate-600">เกินกำหนด</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-900">
                  {stats.avgCompletion}%
                </span>
              </div>
              <p className="text-sm text-slate-600">เฉลี่ยงาน</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="ค้นหาใบสั่งงาน, หมายเลขงาน, ผู้รับผิดชอบ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-blue-300"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="pending">รอดำเนินการ</SelectItem>
                      <SelectItem value="in_progress">
                        กำลังดำเนินการ
                      </SelectItem>
                      <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                      <SelectItem value="cancelled">ยกเลิก</SelectItem>
                      <SelectItem value="on_hold">พักงาน</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="ความสำคัญ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกระดับ</SelectItem>
                      <SelectItem value="1">ต่ำ</SelectItem>
                      <SelectItem value="2">ปานกลาง</SelectItem>
                      <SelectItem value="3">สูง</SelectItem>
                      <SelectItem value="4">วิกฤติ</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={workTypeFilter}
                    onValueChange={setWorkTypeFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="ประเภทงาน" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกประเภท</SelectItem>
                      {workTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getWorkTypeInfo(type).text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="เรียงตาม" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">วันที่สร้าง</SelectItem>
                      <SelectItem value="scheduled_date">
                        วันที่กำหนด
                      </SelectItem>
                      <SelectItem value="priority">ความสำคัญ</SelectItem>
                      <SelectItem value="status">สถานะ</SelectItem>
                      <SelectItem value="title">ชื่องาน</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  >
                    {sortOrder === "asc" ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                  >
                    {viewMode === "grid" ? (
                      <List className="h-4 w-4" />
                    ) : (
                      <Grid className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Work Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredWorkOrders.length === 0 ? (
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  ไม่พบใบสั่งงาน
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  workTypeFilter !== "all"
                    ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา"
                    : "เริ่มต้นสร้างใบสั่งงานแรกของคุณ"}
                </p>
                <Link to="/work-orders/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    สร้างใบสั่งงาน
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              <AnimatePresence>
                {filteredWorkOrders.map((workOrder: WorkOrder, index) => {
                  const statusInfo = getStatusInfo(workOrder.status);
                  const priorityInfo = getPriorityInfo(workOrder.priority);
                  const workTypeInfo = getWorkTypeInfo(workOrder.work_type);
                  const taskInfo = getTaskCompletion(workOrder.id);

                  return (
                    <motion.div
                      key={workOrder.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className={cn("text-xs", workTypeInfo.color)}
                                >
                                  <workTypeInfo.icon className="h-3 w-3 mr-1" />
                                  {workTypeInfo.text}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="text-xs text-slate-600"
                                >
                                  #{workOrder.wo_number}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {workOrder.title}
                              </h3>
                              <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                                {workOrder.description}
                              </p>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  การด���เนินการ
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                  <Link to={`/work-orders/${workOrder.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    ดูรายละเอียด
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/work-orders/${workOrder.id}/edit`}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    แก้ไข
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedWorkOrder(workOrder.id);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  ลบ
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Status and Priority */}
                          <div className="flex flex-wrap gap-2">
                            <Badge className={cn("text-xs", statusInfo.color)}>
                              <statusInfo.icon className="h-3 w-3 mr-1" />
                              {statusInfo.text}
                            </Badge>
                            <Badge
                              className={cn("text-xs", priorityInfo.color)}
                            >
                              <priorityInfo.icon className="h-3 w-3 mr-1" />
                              {priorityInfo.text}
                            </Badge>
                          </div>

                          {/* Task Progress */}
                          {taskInfo.total > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">
                                  ความคืบหน้า
                                </span>
                                <span className="font-medium text-slate-900">
                                  {taskInfo.completed}/{taskInfo.total} (
                                  {taskInfo.percentage}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${taskInfo.percentage}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              {workOrder.assigned_to && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <User className="h-4 w-4" />
                                  <span className="truncate">
                                    {workOrder.assigned_to}
                                  </span>
                                </div>
                              )}
                              {workOrder.estimated_hours && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Timer className="h-4 w-4" />
                                  <span>{workOrder.estimated_hours} ชม.</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="h-4 w-4" />
                                <span className="text-xs">
                                  {new Date(
                                    workOrder.created_at,
                                  ).toLocaleDateString("th-TH")}
                                </span>
                              </div>
                              {workOrder.total_cost && (
                                <div className="flex items-center gap-2 text-slate-600">
                                  <DollarSign className="h-4 w-4" />
                                  <span>
                                    ฿{workOrder.total_cost.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <Link to={`/work-orders/${workOrder.id}`}>
                            <Button
                              variant="outline"
                              className="w-full mt-4 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
                            >
                              ดูรายละเอียด
                              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  เกิดข้อผิดพลาด: {error.message}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบใบสั่งงาน</AlertDialogTitle>
              <AlertDialogDescription>
                การดำเนินการนี้ไม่สามารถยกเลิกได้
                ใบสั่งงานและข้อมูลที่เกี่ยวข้องทั้งหมดจะถูกลบอย่างถาวร
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWorkOrder}
                className="bg-red-600 hover:bg-red-700"
              >
                ลบใบสั่งงาน
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
