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
  List
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

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  created_at: string;
  due_date?: string;
  asset_id?: string;
  asset_name?: string;
  location?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost?: number;
}

export function WorkOrders() {
  const { workOrders, loading, error, refresh } = useSupabaseData();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filter and sort work orders
  const filteredWorkOrders = useMemo(() => {
    if (!workOrders) return [];

    let filtered = workOrders.filter((wo: WorkOrder) => {
      const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           wo.asset_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort
    filtered.sort((a: WorkOrder, b: WorkOrder) => {
      let aValue = a[sortBy as keyof WorkOrder];
      let bValue = b[sortBy as keyof WorkOrder];
      
      if (sortBy === "created_at" || sortBy === "due_date") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [workOrders, searchTerm, statusFilter, priorityFilter, sortBy, sortOrder]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'in_progress': return Activity;
      case 'completed': return CheckCircle;
      case 'cancelled': return AlertCircle;
      default: return FileText;
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low': return Zap;
      case 'medium': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'critical': return AlertTriangle;
      default: return FileText;
    }
  };

  // Handle delete work order
  const handleDeleteWorkOrder = async () => {
    if (!selectedWorkOrder) return;
    
    try {
      // Delete work order logic here
      toast.success("ลบใบสั่งงานเรียบร้อยแล้ว");
      setShowDeleteDialog(false);
      setSelectedWorkOrder(null);
      refresh();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการลบใบสั่งงาน");
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!workOrders) return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
    
    const total = workOrders.length;
    const pending = workOrders.filter((wo: WorkOrder) => wo.status === 'pending').length;
    const inProgress = workOrders.filter((wo: WorkOrder) => wo.status === 'in_progress').length;
    const completed = workOrders.filter((wo: WorkOrder) => wo.status === 'completed').length;
    const overdue = workOrders.filter((wo: WorkOrder) => 
      wo.due_date && new Date(wo.due_date) < new Date() && wo.status !== 'completed'
    ).length;
    
    return { total, pending, inProgress, completed, overdue };
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
                รีเฟรช
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
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
              </div>
              <p className="text-sm text-slate-600">ทั้งหมด</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-900">{stats.pending}</span>
              </div>
              <p className="text-sm text-slate-600">รออนุมัติ</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-900">{stats.inProgress}</span>
              </div>
              <p className="text-sm text-slate-600">กำลังทำ</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-900">{stats.completed}</span>
              </div>
              <p className="text-sm text-slate-600">เสร็จแล้ว</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-red-900">{stats.overdue}</span>
              </div>
              <p className="text-sm text-slate-600">เกินกำหนด</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="ค้นหาใบสั่งงาน..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-blue-500"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="สถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                      <SelectItem value="pending">รออนุมัติ</SelectItem>
                      <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                      <SelectItem value="cancelled">ยกเลิก</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="ความสำคัญ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ความสำคัญทั้งหมด</SelectItem>
                      <SelectItem value="low">ต่ำ</SelectItem>
                      <SelectItem value="medium">กลาง</SelectItem>
                      <SelectItem value="high">สูง</SelectItem>
                      <SelectItem value="critical">วิกฤต</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>เรียงตาม</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setSortBy("created_at")}>
                        วันที่สร้าง
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("due_date")}>
                        วันครบกำหนด
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("priority")}>
                        ความสำคัญ
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                        {sortOrder === "asc" ? "มากไปน้อย" : "น้อยไปมาก"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-8 w-8 p-0"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
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
          {filteredWorkOrders.length > 0 ? (
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              <AnimatePresence>
                {filteredWorkOrders.map((workOrder: WorkOrder, index: number) => {
                  const StatusIcon = getStatusIcon(workOrder.status);
                  const PriorityIcon = getPriorityIcon(workOrder.priority);
                  
                  return (
                    <motion.div
                      key={workOrder.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <StatusIcon className="h-4 w-4 text-slate-600" />
                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                  {workOrder.title}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                                {workOrder.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className={`text-xs border ${getStatusColor(workOrder.status)}`}>
                                  {workOrder.status === 'pending' && 'รออนุมัติ'}
                                  {workOrder.status === 'in_progress' && 'กำลังทำ'}
                                  {workOrder.status === 'completed' && 'เสร็จแล้ว'}
                                  {workOrder.status === 'cancelled' && 'ยกเลิก'}
                                </Badge>
                                <Badge className={`text-xs border ${getPriorityColor(workOrder.priority)}`}>
                                  <PriorityIcon className="h-3 w-3 mr-1" />
                                  {workOrder.priority === 'low' && 'ต่ำ'}
                                  {workOrder.priority === 'medium' && 'กลาง'}
                                  {workOrder.priority === 'high' && 'สูง'}
                                  {workOrder.priority === 'critical' && 'วิกฤต'}
                                </Badge>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/work-orders/${workOrder.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    ดูรายละเอียด
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/work-orders/edit/${workOrder.id}`}>
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

                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {workOrder.asset_name && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Wrench className="h-4 w-4" />
                                <span>{workOrder.asset_name}</span>
                              </div>
                            )}
                            
                            {workOrder.assigned_to && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <User className="h-4 w-4" />
                                <span>{workOrder.assigned_to}</span>
                              </div>
                            )}
                            
                            {workOrder.location && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="h-4 w-4" />
                                <span>{workOrder.location}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-slate-500">
                              <span>สร้างเมื่อ: {new Date(workOrder.created_at).toLocaleDateString('th-TH')}</span>
                              {workOrder.due_date && (
                                <span className={cn(
                                  "font-medium",
                                  new Date(workOrder.due_date) < new Date() && workOrder.status !== 'completed'
                                    ? "text-red-600"
                                    : "text-slate-600"
                                )}>
                                  ครบกำหนด: {new Date(workOrder.due_date).toLocaleDateString('th-TH')}
                                </span>
                              )}
                            </div>
                            
                            <div className="pt-3 border-t border-slate-200">
                              <Link to={`/work-orders/${workOrder.id}`}>
                                <Button variant="ghost" className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                  ดูรายละเอียด
                                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">ไม่พบใบสั่งงาน</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                    ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา"
                    : "เริ่มต้นด้วยการสร้างใบสั่งงานแรกของคุณ"
                  }
                </p>
                <Link to="/work-orders/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    สร้างใบสั่งงานใหม่
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Error State */}
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบใบสั่งงาน</AlertDialogTitle>
              <AlertDialogDescription>
                คุณต้องการลบใบสั่งงานนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถยกเลิกได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteWorkOrder} className="bg-red-600 hover:bg-red-700">
                ลบใบสั่งงาน
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
