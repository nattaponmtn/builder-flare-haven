import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Wrench,
  FileText,
  Save,
  Plus,
  X,
  Search,
  Building,
  CircuitBoard,
  Package,
  Users,
  CheckCircle,
  AlertCircle,
  Timer,
  DollarSign,
  Sparkles,
  Settings,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { createTableService } from "../../shared/supabase/database-service";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/use-supabase-data";

// Interface based on real database schema
interface WorkOrderForm {
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
  scheduled_date: string;
  wo_number: string;
  estimated_hours: number;
  company_id: string;
}

interface WorkOrderTask {
  description: string;
  is_critical: boolean;
  expected_input_type: string;
  standard_text_expected: string;
  standard_min_value: number;
  standard_max_value: number;
}

interface Asset {
  id: string;
  equipment_type_id: string;
  system_id: string;
  serial_number: string;
  status: string;
  company_id: string;
}

interface User {
  id: string;
  user_id: string;
  company_id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  is_active: boolean;
}

export function CreateWorkOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const { assets, locations, systems, pmTemplates } = useSupabaseData();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showAssetSearch, setShowAssetSearch] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const [formData, setFormData] = useState<WorkOrderForm>({
    work_type: 'preventive',
    title: '',
    description: '',
    status: 'pending',
    priority: 2,
    asset_id: '',
    location_id: '',
    system_id: '',
    pm_template_id: '',
    assigned_to_user_id: '',
    requested_by_user_id: user?.id || '',
    scheduled_date: new Date().toISOString().split('T')[0],
    wo_number: '',
    estimated_hours: 0,
    company_id: userProfile?.company_id || '',
  });

  const [tasks, setTasks] = useState<WorkOrderTask[]>([]);
  const [newTask, setNewTask] = useState<WorkOrderTask>({
    description: '',
    is_critical: false,
    expected_input_type: 'text',
    standard_text_expected: '',
    standard_min_value: 0,
    standard_max_value: 0,
  });

  // Load users for assignment
  useEffect(() => {
    const loadUsers = async () => {
      if (!userProfile?.company_id) return;
      
      try {
        const userProfilesService = createTableService('user_profiles');
        const result = await userProfilesService.getByField('company_id', userProfile.company_id);
        if (result.data) {
          setAvailableUsers(result.data.filter((u: User) => u.is_active) as User[]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [userProfile]);

  // Load work order data if editing
  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!isEdit || !id) return;
      
      setLoading(true);
      try {
        const workOrderService = createTableService('work_orders');
        const tasksService = createTableService('work_order_tasks');
        
        // Load work order
        const woResult = await workOrderService.getById(id);
        if (woResult.data) {
          setFormData(woResult.data as WorkOrderForm);
        }
        
        // Load tasks
        const tasksResult = await tasksService.getByField('work_order_id', id);
        if (tasksResult.data) {
          setTasks(tasksResult.data as WorkOrderTask[]);
        }
      } catch (error) {
        console.error('Error loading work order:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลใบสั่งงานได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrder();
  }, [isEdit, id, toast]);

  // Generate work order number
  const generateWONumber = async () => {
    try {
      const workOrderService = createTableService('work_orders');
      const result = await workOrderService.getAll({ 
        filters: { company_id: userProfile?.company_id },
        orderBy: 'created_at',
        ascending: false,
        limit: 1
      });
      
      const currentYear = new Date().getFullYear();
      const prefix = `WO${currentYear}-`;
      let number = 1;
      
      if (result.data && result.data.length > 0) {
        const lastWO = result.data[0] as any;
        const lastNumber = lastWO.wo_number?.split('-')[1];
        if (lastNumber) {
          number = parseInt(lastNumber) + 1;
        }
      }
      
      return `${prefix}${number.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating WO number:', error);
      return `WO${new Date().getFullYear()}-0001`;
    }
  };

  // Load template tasks
  const loadTemplateTasksf = async (templateId: string) => {
    try {
      const templateDetailsService = createTableService('pm_template_details');
      const result = await templateDetailsService.getByField('pm_template_id', templateId, {
        orderBy: 'step_number',
        ascending: true
      });
      
      if (result.data) {
        const templateTasks = result.data.map((detail: any) => ({
          description: detail.task_description,
          is_critical: detail.is_critical || false,
          expected_input_type: detail.expected_input_type || 'text',
          standard_text_expected: detail.standard_text_expected || '',
          standard_min_value: detail.standard_min_value || 0,
          standard_max_value: detail.standard_max_value || 0,
        }));
        
        setTasks(templateTasks);
        setShowTemplateDialog(false);
        
        toast({
          title: "สำเร็จ",
          description: `โหลดงานจากเทมเพลต ${templateTasks.length} รายการ`,
        });
      }
    } catch (error) {
      console.error('Error loading template tasks:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดงานจากเทมเพลตได้",
        variant: "destructive",
      });
    }
  };

  // Add new task
  const addTask = () => {
    if (!newTask.description.trim()) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาใส่รายละเอียดงาน",
        variant: "destructive",
      });
      return;
    }
    
    setTasks([...tasks, { ...newTask }]);
    setNewTask({
      description: '',
      is_critical: false,
      expected_input_type: 'text',
      standard_text_expected: '',
      standard_min_value: 0,
      standard_max_value: 0,
    });
  };

  // Remove task
  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกข้อมูลที่จำเป็น",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const workOrderService = createTableService('work_orders');
      const tasksService = createTableService('work_order_tasks');
      
      // Generate WO number if creating new
      if (!isEdit && !formData.wo_number) {
        formData.wo_number = await generateWONumber();
      }
      
      let workOrderId = id;
      
      if (isEdit) {
        // Update existing work order
        await workOrderService.update(id!, formData);
        
        // Delete existing tasks and recreate
        // Note: In production, you might want more sophisticated task update logic
        const existingTasks = await tasksService.getByField('work_order_id', id!);
        if (existingTasks.data) {
          for (const task of existingTasks.data) {
            await tasksService.delete((task as any).id);
          }
        }
      } else {
        // Create new work order
        const result = await workOrderService.create(formData);
        if (result.data) {
          workOrderId = (result.data as any).id;
        }
      }
      
      // Create tasks
      if (workOrderId && tasks.length > 0) {
        for (const task of tasks) {
          await tasksService.create({
            work_order_id: workOrderId,
            ...task
          });
        }
      }
      
      toast({
        title: "สำเร็จ",
        description: isEdit ? "อัปเดตใบสั่งงานเรียบร้อยแล้ว" : "สร้างใบสั่งงานเรียบร้อยแล้ว",
      });
      
      navigate('/work-orders');
      
    } catch (error) {
      console.error('Error saving work order:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกใบสั่งงานได้",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const workTypes = [
    { value: 'preventive', label: 'บำรุงรักษาเชิงป้องกัน', icon: Settings },
    { value: 'corrective', label: 'แก้ไขเมื่อเสีย', icon: Wrench },
    { value: 'inspection', label: 'ตรวจสอบ', icon: Eye },
    { value: 'emergency', label: 'ฉุกเฉิน', icon: AlertTriangle },
  ];

  const priorities = [
    { value: 1, label: 'ต่ำ', color: 'bg-green-100 text-green-800' },
    { value: 2, label: 'ปานกลาง', color: 'bg-yellow-100 text-yellow-800' },
    { value: 3, label: 'สูง', color: 'bg-orange-100 text-orange-800' },
    { value: 4, label: 'วิกฤติ', color: 'bg-red-100 text-red-800' },
  ];

  const inputTypes = [
    { value: 'text', label: 'ข้อความ' },
    { value: 'number', label: 'ตัวเลข' },
    { value: 'checkbox', label: 'เลือก (ใช่/ไม่ใช่)' },
    { value: 'measurement', label: 'การวัด (มีช่วงค่า)' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">กำลังโหลดข้อม���ล...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="p-4 sm:p-6 pb-20 md:pb-6 space-y-6 max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button variant="outline" size="icon" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              {isEdit ? 'แก้ไขใบสั่งงาน' : 'สร้างใบสั่งงาน'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEdit ? 'อัปเดตข้อมูลใบสั่งงาน' : 'สร้างใบสั่งงานบำรุงรักษาใหม่'}
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  ข้อมูลพื้นฐาน
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="work_type">ประเภทงาน</Label>
                    <Select value={formData.work_type} onValueChange={(value) => setFormData({...formData, work_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">ความสำคัญ</Label>
                    <Select value={formData.priority.toString()} onValueChange={(value) => setFormData({...formData, priority: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value.toString()}>
                            <Badge className={priority.color} variant="outline">
                              {priority.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">ชื่องาน</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="ระบุชื่องานบำรุงรักษา"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">รายละเอียด</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="อธิบายรายละเอียดงานที่ต้องดำเนินการ"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_date">วันที่กำหนด</Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_hours">ชั่วโมงที่ประมาณ</Label>
                    <Input
                      id="estimated_hours"
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => setFormData({...formData, estimated_hours: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assignment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  การมอบหมาย
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="assigned_to_user_id">ผู้รับผิดชอบ</Label>
                  <Select value={formData.assigned_to_user_id} onValueChange={(value) => setFormData({...formData, assigned_to_user_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.user_id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {user.first_name} {user.last_name} ({user.role})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="asset_id">อุปกรณ์</Label>
                    <Select value={formData.asset_id} onValueChange={(value) => setFormData({...formData, asset_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกอุปกรณ์" />
                      </SelectTrigger>
                      <SelectContent>
                        {assets?.map((asset: any) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            <div className="flex items-center gap-2">
                              <CircuitBoard className="h-4 w-4" />
                              {asset.serial_number}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location_id">สถานที่</Label>
                    <Select value={formData.location_id} onValueChange={(value) => setFormData({...formData, location_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานที่" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations?.map((location: any) => (
                          <SelectItem key={location.id} value={location.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {location.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="system_id">ระบบ</Label>
                    <Select value={formData.system_id} onValueChange={(value) => setFormData({...formData, system_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกระบบ" />
                      </SelectTrigger>
                      <SelectContent>
                        {systems?.map((system: any) => (
                          <SelectItem key={system.id} value={system.id}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {system.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    รายการงาน ({tasks.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Sparkles className="h-4 w-4 mr-2" />
                          โหลดจากเทมเพลต
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>เลือกเทมเพลต PM</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {pmTemplates?.map((template: any) => (
                            <Card key={template.id} className="cursor-pointer hover:bg-slate-50 transition-colors"
                                  onClick={() => loadTemplateTasksf(template.id)}>
                              <CardContent className="p-4">
                                <h4 className="font-medium">{template.name}</h4>
                                <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                  <span>ระยะเวลา: {template.estimated_duration || template.estimated_minutes} นาที</span>
                                  <span>ความถี่: ทุก {template.frequency_value} {template.frequency_type}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Add New Task */}
                <Card className="border-dashed border-2 border-slate-300">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new_task_description">รายละเอียดงาน</Label>
                      <Textarea
                        id="new_task_description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        placeholder="อธิบายงานที่ต้องดำเนินการ"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expected_input_type">ประเภทการตอบ</Label>
                        <Select value={newTask.expected_input_type} onValueChange={(value) => setNewTask({...newTask, expected_input_type: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {inputTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id="is_critical"
                          checked={newTask.is_critical}
                          onCheckedChange={(checked) => setNewTask({...newTask, is_critical: checked as boolean})}
                        />
                        <Label htmlFor="is_critical" className="text-sm font-medium">
                          งานสำคัญ (Critical)
                        </Label>
                      </div>
                    </div>

                    {/* Additional fields based on input type */}
                    {newTask.expected_input_type === 'text' && (
                      <div className="space-y-2">
                        <Label htmlFor="standard_text_expected">ค่าที่คาดหวัง (ถ้ามี)</Label>
                        <Input
                          id="standard_text_expected"
                          value={newTask.standard_text_expected}
                          onChange={(e) => setNewTask({...newTask, standard_text_expected: e.target.value})}
                          placeholder="เช่น: ปกติ, ผ่าน, OK"
                        />
                      </div>
                    )}

                    {newTask.expected_input_type === 'measurement' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="standard_min_value">ค่าต่ำสุด</Label>
                          <Input
                            id="standard_min_value"
                            type="number"
                            value={newTask.standard_min_value}
                            onChange={(e) => setNewTask({...newTask, standard_min_value: parseFloat(e.target.value) || 0})}
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="standard_max_value">ค่าสูงสุด</Label>
                          <Input
                            id="standard_max_value"
                            type="number"
                            value={newTask.standard_max_value}
                            onChange={(e) => setNewTask({...newTask, standard_max_value: parseFloat(e.target.value) || 0})}
                            placeholder="100"
                            step="0.01"
                          />
                        </div>
                      </div>
                    )}

                    <Button type="button" onClick={addTask} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      เพิ่มงาน
                    </Button>
                  </CardContent>
                </Card>

                {/* Tasks List */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {tasks.map((task, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="border border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    งานที่ {index + 1}
                                  </Badge>
                                  {task.is_critical && (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      สำคัญ
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {inputTypes.find(t => t.value === task.expected_input_type)?.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-900 mb-2">{task.description}</p>
                                {task.standard_text_expected && (
                                  <p className="text-xs text-slate-500">คาดหวัง: {task.standard_text_expected}</p>
                                )}
                                {task.expected_input_type === 'measurement' && (
                                  <p className="text-xs text-slate-500">
                                    ช่วงค่า: {task.standard_min_value} - {task.standard_max_value}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTask(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {tasks.length === 0 && (
                    <Card className="border-dashed border-2 border-slate-300">
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500">ยังไม่มีรายการงาน</p>
                        <p className="text-sm text-slate-400 mt-1">เพิ่มงานที่ต้องดำเนินการ หรือโหลดจากเทมเพลต</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            className="flex justify-end gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button type="button" variant="outline" onClick={() => navigate('/work-orders')}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'อัปเดต' : 'สร้าง'}ใบสั่งงาน
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
