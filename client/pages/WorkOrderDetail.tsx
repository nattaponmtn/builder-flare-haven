import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Edit3
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

// Mock data - in real app this would come from API/database
const workOrderData = {
  "WO-2024-001": {
    id: "WO-2024-001",
    title: "บำรุงรักษาเครื่องยนต์รถแทรกเตอร์",
    description: "ตรวจสอบบำรุงรักษาตามกำหนดสำหรับรถขุด CAT 320D รวมถึงเปลี่ยนน้ำมันเครื่อง เปลี่ยนไส้กรอง และตรวจสอบทั่วไป",
    status: "กำลังดำเนินการ",
    priority: "สูง",
    assignee: "สมชาย รักงาน",
    asset: "CAT-320D-001",
    assetName: "รถขุด CAT 320D",
    location: "ไร่ A",
    dueDate: "15/01/2567",
    createdDate: "10/01/2567",
    estimatedHours: 4,
    actualHours: 2.5,
    type: "ป้องกัน",
    requestedBy: "สมศักดิ์ หัวหน้าช่าง",
    tasks: [
      {
        id: 1,
        description: "ตรวจสอบระดับและคุณภาพน้ำมันเครื่อง",
        isCompleted: true,
        actualValue: "ระดับน้ำมันปกติ สีดี",
        completedAt: "13/01/2567 09:30",
        isCritical: false
      },
      {
        id: 2,
        description: "เปลี่ยนไส้กรองน้ำมันเครื่อง",
        isCompleted: true,
        actualValue: "เปลี่ยนไส้กรองแล้วด้วยชิ้นส่วน #OF-4553",
        completedAt: "13/01/2567 10:15",
        isCritical: true
      },
      {
        id: 3,
        description: "ตรวจสอบระดับน้ำมันไฮดรอลิก",
        isCompleted: false,
        actualValue: "",
        completedAt: null,
        isCritical: false
      },
      {
        id: 4,
        description: "ตรวจสอบการสึกหรอของใส",
        isCompleted: false,
        actualValue: "",
        completedAt: null,
        isCritical: true
      },
      {
        id: 5,
        description: "ทดสอบการทำงานของระบบไฮดรอลิกทั้งหมด",
        isCompleted: false,
        actualValue: "",
        completedAt: null,
        isCritical: false
      }
    ],
    parts: [
      { name: "ไส้กรองน้ำมันเครื่อง", partNumber: "OF-4553", quantity: 1, used: true },
      { name: "น้ำมันเครื่อง 15W-40", partNumber: "EO-1540", quantity: 8, used: false },
      { name: "ไส้กรองไฮดรอลิก", partNumber: "HF-2021", quantity: 1, used: false }
    ],
    attachments: [
      { name: "รูปก่อนบำรุงรักษา.jpg", type: "image", uploadedAt: "13/01/2567 09:00" },
      { name: "รายงานวิเคราะห์น้ำมัน.pdf", type: "document", uploadedAt: "10/01/2567 14:30" }
    ]
  }
};

export function WorkOrderDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [taskNote, setTaskNote] = useState("");
  
  const workOrder = workOrderData[id as keyof typeof workOrderData];
  
  if (!workOrder) {
    return (
      <div className="min-h-screen">
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold">Work Order Not Found</h1>
          <Link to="/work-orders">
            <Button className="mt-4">Back to Work Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = workOrder.tasks.filter(task => task.isCompleted).length;
  const totalTasks = workOrder.tasks.length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success text-success-foreground";
      case "In Progress":
        return "bg-warning text-warning-foreground";
      case "Overdue":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-destructive text-destructive-foreground";
      case "High":
        return "bg-warning text-warning-foreground";
      case "Medium":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 pt-2">
          <Link to="/work-orders">
            <Button variant="outline" size="sm" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{workOrder.title}</h1>
            <p className="text-sm text-muted-foreground">{workOrder.id}</p>
          </div>
          <Button size="sm" className="shrink-0">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(workOrder.status)}`}>
              {workOrder.status}
            </div>
          </div>
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(workOrder.priority)}`}>
              {workOrder.priority}
            </div>
          </div>
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-lg font-bold">{progressPercent}%</div>
          </div>
          <div className="card-elevated rounded-xl p-4 text-center">
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="text-lg font-bold">{workOrder.actualHours}h</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card-elevated rounded-xl p-1">
          <div className="flex space-x-1">
            {[
              { id: "details", label: "Details", icon: FileText },
              { id: "tasks", label: "Tasks", icon: CheckCircle },
              { id: "parts", label: "Parts", icon: Settings },
              { id: "attachments", label: "Files", icon: Camera }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="card-elevated rounded-xl p-5">
              <h3 className="font-semibold mb-4">Work Order Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Assigned to</div>
                    <div className="font-medium">{workOrder.assignee}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Due Date</div>
                    <div className="font-medium">{workOrder.dueDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Location</div>
                    <div className="font-medium">{workOrder.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">Asset</div>
                    <div className="font-medium">{workOrder.assetName}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card-elevated rounded-xl p-5">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{workOrder.description}</p>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-3">
            {workOrder.tasks.map((task) => (
              <div key={task.id} className={`card-elevated rounded-xl p-4 ${task.isCritical ? 'border-l-4 border-l-warning' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="pt-1">
                    {task.isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {task.description}
                      </h4>
                      {task.isCritical && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Critical
                        </Badge>
                      )}
                    </div>
                    
                    {task.isCompleted ? (
                      <div className="space-y-1">
                        <p className="text-sm text-success">✓ {task.actualValue}</p>
                        <p className="text-xs text-muted-foreground">Completed: {task.completedAt}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add notes or results..."
                          value={taskNote}
                          onChange={(e) => setTaskNote(e.target.value)}
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Camera className="h-4 w-4 mr-2" />
                            Photo
                          </Button>
                          <Button size="sm">
                            Mark Complete
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "parts" && (
          <div className="space-y-3">
            {workOrder.parts.map((part, index) => (
              <div key={index} className="card-elevated rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{part.name}</h4>
                    <p className="text-sm text-muted-foreground">Part #: {part.partNumber}</p>
                    <p className="text-sm">Quantity: {part.quantity}</p>
                  </div>
                  <div className="text-right">
                    {part.used ? (
                      <Badge className="bg-success text-success-foreground">Used</Badge>
                    ) : (
                      <Badge variant="outline">Reserved</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-3">
            {workOrder.attachments.map((file, index) => (
              <div key={index} className="card-elevated rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {file.type === "image" ? (
                      <Camera className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">Uploaded: {file.uploadedAt}</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              </div>
            ))}
            <Button className="w-full" variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Add Photo/Document
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button className="flex-1">
            Update Status
          </Button>
          <Button variant="outline" className="flex-1">
            Add Time
          </Button>
        </div>
      </div>
    </div>
  );
}
