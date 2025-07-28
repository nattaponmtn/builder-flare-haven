import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileText,
  Settings,
  Wrench,
  Timer,
  Edit3,
  Play,
  Pause,
  Save,
  MessageSquare,
  Package,
  Upload,
  Shield,
  History,
  Eye,
  Edit,
  Trash2,
  Building,
  CircuitBoard,
  DollarSign,
  Activity,
  PlayCircle,
  PauseCircle,
  XCircle,
  RotateCcw,
  CheckSquare,
  AlertCircle,
  Zap,
  BarChart3,
  Clock3,
  UserCheck,
  Target,
  ClipboardCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createTableService } from "../../shared/supabase/database-service";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

// Interface based on real database schema
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
  expected_input_type?: string;
  standard_text_expected?: string;
  standard_min_value?: number;
  standard_max_value?: number;
}

interface Asset {
  id: string;
  equipment_type_id: string;
  system_id: string;
  serial_number: string;
  status: string;
  company_id: string;
}

interface Location {
  id: string;
  company_id: string;
  name: string;
  code: string;
  address: string;
  is_active: boolean;
}

interface System {
  id: string;
  company_id: string;
  name: string;
  name_th: string;
  description: string;
  code: string;
  location_id: string;
  is_active: boolean;
}

export function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [system, setSystem] = useState<System | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, startTime]);

  // Load work order and related data
  useEffect(() => {
    const loadWorkOrderData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const workOrderService = createTableService("work_orders");
        const tasksService = createTableService("work_order_tasks");
        const assetsService = createTableService("assets");
        const locationsService = createTableService("locations");
        const systemsService = createTableService("systems");

        // Load work order
        const woResult = await workOrderService.getById(id);
        if (woResult.data) {
          const wo = woResult.data as WorkOrder;
          setWorkOrder(wo);

          // Load related data
          const [tasksResult, assetResult, locationResult, systemResult] =
            await Promise.allSettled([
              tasksService.getByField("work_order_id", id),
              wo.asset_id
                ? assetsService.getById(wo.asset_id)
                : Promise.resolve({ data: null }),
              wo.location_id
                ? locationsService.getById(wo.location_id)
                : Promise.resolve({ data: null }),
              wo.system_id
                ? systemsService.getById(wo.system_id)
                : Promise.resolve({ data: null }),
            ]);

          if (tasksResult.status === "fulfilled" && tasksResult.value.data) {
            setTasks(tasksResult.value.data as WorkOrderTask[]);
          }

          if (assetResult.status === "fulfilled" && assetResult.value.data) {
            setAsset(assetResult.value.data as Asset);
          }

          if (
            locationResult.status === "fulfilled" &&
            locationResult.value.data
          ) {
            setLocation(locationResult.value.data as Location);
          }

          if (systemResult.status === "fulfilled" && systemResult.value.data) {
            setSystem(systemResult.value.data as System);
          }
        }
      } catch (error) {
        console.error("Error loading work order:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลใบสั่งงานได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrderData();
  }, [id, toast]);

  // Get status info
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

  // Get priority info
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

  // Calculate task completion
  const getTaskCompletion = () => {
    if (tasks.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completed = tasks.filter((task) => task.is_completed).length;
    return {
      completed,
      total: tasks.length,
      percentage: Math.round((completed / tasks.length) * 100),
    };
  };

  // Handle task completion
  const handleTaskComplete = async (
    taskId: string,
    value: string | number | boolean,
  ) => {
    try {
      const tasksService = createTableService("work_order_tasks");
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updateData: any = {
        is_completed: true,
        completed_at: new Date().toISOString(),
      };

      // Set value based on expected input type
      if (
        task.expected_input_type === "number" ||
        task.expected_input_type === "measurement"
      ) {
        updateData.actual_value_numeric = parseFloat(value as string) || 0;
      } else if (task.expected_input_type === "checkbox") {
        updateData.actual_value_text = value ? "ใช่" : "ไม่ใช่";
      } else {
        updateData.actual_value_text = value as string;
      }

      await tasksService.update(taskId, updateData);

      // Update local state
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, ...updateData } : t)),
      );

      toast({
        title: "สำเร็จ",
        description: "บันทึกผลงานเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกผลงานได้",
        variant: "destructive",
      });
    }
  };

  // Handle task uncomplete
  const handleTaskUncomplete = async (taskId: string) => {
    try {
      const tasksService = createTableService("work_order_tasks");

      const updateData = {
        is_completed: false,
        completed_at: null,
        actual_value_text: "",
        actual_value_numeric: 0,
      };

      await tasksService.update(taskId, updateData);

      // Update local state
      setTasks(
        tasks.map((t) => (t.id === taskId ? { ...t, ...updateData } : t)),
      );

      toast({
        title: "สำเร็จ",
        description: "ยกเลิกการทำงานเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถยกเลิกการทำงานได้",
        variant: "destructive",
      });
    }
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!workOrder || !newStatus) return;

    setSaving(true);
    try {
      const workOrderService = createTableService("work_orders");

      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Set completion time if status is completed
      if (newStatus === "completed" || newStatus === "เสร็จสิ้น") {
        updateData.completed_at = new Date().toISOString();
        if (elapsedTime > 0) {
          updateData.actual_hours = elapsedTime / (1000 * 60 * 60); // Convert to hours
        }
      }

      await workOrderService.update(workOrder.id, updateData);

      setWorkOrder({ ...workOrder, ...updateData });
      setShowStatusDialog(false);
      setNewStatus("");
      setStatusComment("");

      toast({
        title: "สำเร็จ",
        description: "อัปเดตสถานะเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Start/Stop timer
  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      setStartTime(new Date());
      setIsTimerRunning(true);
    }
  };

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return `${hours.toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">กำลังโหลดข้อมูล...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              ไม่พบใบสั่งงาน
            </h3>
            <p className="text-slate-600 mb-4">
              ใบสั่งงานที่ระบุไม่มีอยู่ในระบบ
            </p>
            <Button onClick={() => navigate("/work-orders")}>
              กลับสู่รายการใบสั่งงาน
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(workOrder.status);
  const priorityInfo = getPriorityInfo(workOrder.priority);
  const workTypeInfo = getWorkTypeInfo(workOrder.work_type);
  const taskCompletion = getTaskCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/work-orders")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  {workOrder.title}
                </h1>
                <Badge variant="outline" className="text-sm">
                  #{workOrder.wo_number}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn("text-sm", statusInfo.color)}>
                  <statusInfo.icon className="h-3 w-3 mr-1" />
                  {statusInfo.text}
                </Badge>
                <Badge className={cn("text-sm", priorityInfo.color)}>
                  <priorityInfo.icon className="h-3 w-3 mr-1" />
                  {priorityInfo.text}
                </Badge>
                <Badge className={cn("text-sm", workTypeInfo.color)}>
                  <workTypeInfo.icon className="h-3 w-3 mr-1" />
                  {workTypeInfo.text}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-lg font-mono font-bold text-slate-900">
                        {formatTime(elapsedTime)}
                      </div>
                      <div className="text-xs text-slate-500">เวลาทำงาน</div>
                    </div>
                    <Button
                      variant={isTimerRunning ? "destructive" : "default"}
                      size="sm"
                      onClick={toggleTimer}
                    >
                      {isTimerRunning ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Dialog
                open={showStatusDialog}
                onOpenChange={setShowStatusDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit3 className="h-4 w-4 mr-2" />
                    เปลี่ยนสถานะ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เปลี่ยนสถานะใบสั่งงาน</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_status">สถานะใหม่</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">รอดำเนินการ</SelectItem>
                          <SelectItem value="in_progress">
                            กำลังดำเนินการ
                          </SelectItem>
                          <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                          <SelectItem value="on_hold">พักงาน</SelectItem>
                          <SelectItem value="cancelled">ยกเลิก</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status_comment">หมายเหตุ (ถ้ามี)</Label>
                      <Textarea
                        id="status_comment"
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        placeholder="เหตุผลในการเปลี่ยนสถานะ"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowStatusDialog(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      onClick={handleStatusChange}
                      disabled={!newStatus || saving}
                    >
                      {saving ? "กำลังบันทึก..." : "อัปเดต"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Link to={`/work-orders/${workOrder.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  แก้ไข
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-blue-600" />
                      รายการงาน ({taskCompletion.completed}/
                      {taskCompletion.total})
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">
                        {taskCompletion.percentage}% เสร็จสิ้น
                      </div>
                      <Progress
                        value={taskCompletion.percentage}
                        className="w-32 h-2 mt-1"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckSquare className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500">ไม่มีรายการงาน</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card
                            className={cn(
                              "border transition-all duration-200",
                              task.is_completed
                                ? "border-green-200 bg-green-50/50"
                                : task.is_critical
                                  ? "border-red-200 bg-red-50/50"
                                  : "border-slate-200",
                            )}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <div className="flex items-center gap-2 mt-1">
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                                      task.is_completed
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "border-slate-300 text-slate-500",
                                    )}
                                  >
                                    {task.is_completed ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      index + 1
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {task.is_critical && (
                                      <Badge
                                        variant="destructive"
                                        className="text-xs"
                                      >
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        สำคัญ
                                      </Badge>
                                    )}
                                    {task.is_completed && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-100 text-green-800 border-green-200"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        เสร็จสิ้น
                                      </Badge>
                                    )}
                                  </div>

                                  <h4 className="font-medium text-slate-900 mb-2">
                                    {task.description}
                                  </h4>

                                  {/* Task Input */}
                                  {!task.is_completed ? (
                                    <div className="space-y-3">
                                      {task.expected_input_type ===
                                      "checkbox" ? (
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            id={`task-${task.id}`}
                                            onCheckedChange={(checked) =>
                                              handleTaskComplete(
                                                task.id,
                                                checked,
                                              )
                                            }
                                          />
                                          <Label
                                            htmlFor={`task-${task.id}`}
                                            className="text-sm"
                                          >
                                            ยืนยันการทำงาน
                                          </Label>
                                        </div>
                                      ) : task.expected_input_type ===
                                          "number" ||
                                        task.expected_input_type ===
                                          "measurement" ? (
                                        <div className="space-y-2">
                                          <div className="flex gap-2">
                                            <Input
                                              type="number"
                                              placeholder="ใส่ค่าที่วัดได้"
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleTaskComplete(
                                                    task.id,
                                                    (
                                                      e.target as HTMLInputElement
                                                    ).value,
                                                  );
                                                }
                                              }}
                                              step="0.01"
                                            />
                                            <Button
                                              size="sm"
                                              onClick={(e) => {
                                                const input =
                                                  e.currentTarget.parentElement?.querySelector(
                                                    "input",
                                                  ) as HTMLInputElement;
                                                if (input?.value) {
                                                  handleTaskComplete(
                                                    task.id,
                                                    input.value,
                                                  );
                                                }
                                              }}
                                            >
                                              บันทึก
                                            </Button>
                                          </div>
                                          {task.standard_min_value !==
                                            undefined &&
                                            task.standard_max_value !==
                                              undefined && (
                                              <p className="text-xs text-slate-500">
                                                ช่วงค่าปกติ:{" "}
                                                {task.standard_min_value} -{" "}
                                                {task.standard_max_value}
                                              </p>
                                            )}
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <div className="flex gap-2">
                                            <Input
                                              placeholder="ใส่ผลการตรวจสอบ"
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleTaskComplete(
                                                    task.id,
                                                    (
                                                      e.target as HTMLInputElement
                                                    ).value,
                                                  );
                                                }
                                              }}
                                            />
                                            <Button
                                              size="sm"
                                              onClick={(e) => {
                                                const input =
                                                  e.currentTarget.parentElement?.querySelector(
                                                    "input",
                                                  ) as HTMLInputElement;
                                                if (input?.value) {
                                                  handleTaskComplete(
                                                    task.id,
                                                    input.value,
                                                  );
                                                }
                                              }}
                                            >
                                              บันทึก
                                            </Button>
                                          </div>
                                          {task.standard_text_expected && (
                                            <p className="text-xs text-slate-500">
                                              ค่าที่คาดหวัง:{" "}
                                              {task.standard_text_expected}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm font-medium text-green-900">
                                              ผลการทำงาน:
                                            </p>
                                            <p className="text-sm text-green-800">
                                              {task.actual_value_text ||
                                                task.actual_value_numeric ||
                                                "ทำงานเสร็จสิ้น"}
                                            </p>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleTaskUncomplete(task.id)
                                            }
                                            className="text-orange-600 hover:text-orange-700"
                                          >
                                            <RotateCcw className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                      {task.completed_at && (
                                        <p className="text-xs text-slate-500">
                                          เสร็จเมื่อ:{" "}
                                          {new Date(
                                            task.completed_at,
                                          ).toLocaleString("th-TH")}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    รายละเอียดงาน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    {workOrder.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Work Order Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    ข้อมูลใบสั่งงาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          ผู้รับผ���ดชอบ
                        </p>
                        <p className="text-sm text-slate-600">
                          {workOrder.assigned_to || "ไม่ระบุ"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          ผู้ขอ
                        </p>
                        <p className="text-sm text-slate-600">
                          {workOrder.requested_by || "ไม่ระบุ"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          วันที่สร้าง
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(workOrder.created_at).toLocaleDateString(
                            "th-TH",
                          )}
                        </p>
                      </div>
                    </div>

                    {workOrder.scheduled_date && (
                      <div className="flex items-center gap-3">
                        <Clock3 className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            วันที่กำหนด
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(
                              workOrder.scheduled_date,
                            ).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                      </div>
                    )}

                    {workOrder.completed_at && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            วันที่เสร็จ
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(
                              workOrder.completed_at,
                            ).toLocaleDateString("th-TH")}
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center gap-3">
                      <Timer className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          ชั่วโมงที่ประมาณ
                        </p>
                        <p className="text-sm text-slate-600">
                          {workOrder.estimated_hours || 0} ชม.
                        </p>
                      </div>
                    </div>

                    {workOrder.actual_hours && (
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            ชั่วโมงจริง
                          </p>
                          <p className="text-sm text-slate-600">
                            {workOrder.actual_hours.toFixed(2)} ชม.
                          </p>
                        </div>
                      </div>
                    )}

                    {workOrder.total_cost && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            ค่าใช้จ่ายรวม
                          </p>
                          <p className="text-sm text-slate-600">
                            ฿{workOrder.total_cost.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Asset Info */}
            {(asset || location || system) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      ข้อมูลอุปกรณ์
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {asset && (
                      <div className="flex items-center gap-3">
                        <CircuitBoard className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            อุปกรณ์
                          </p>
                          <p className="text-sm text-slate-600">
                            {asset.serial_number}
                          </p>
                        </div>
                      </div>
                    )}

                    {location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            สถานที่
                          </p>
                          <p className="text-sm text-slate-600">
                            {location.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {system && (
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-slate-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            ระบบ
                          </p>
                          <p className="text-sm text-slate-600">
                            {system.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
