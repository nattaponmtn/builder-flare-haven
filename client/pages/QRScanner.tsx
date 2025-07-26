import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  QrCode,
  Camera,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  MapPin,
  Calendar,
  Settings,
  Flashlight,
  RotateCcw,
  X,
  Search,
  Keyboard,
  History,
  FileSearch
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

// Mock equipment database สำหรับทดสอบการค้นหาหลากหลายกรณี
const equipmentDatabase = {
  "TRACT-001": {
    id: "TRACT-001",
    name: "รถแทรกเตอร์ Kubota M7060",
    type: "รถแทรกเตอร์",
    location: "ไร่ A",
    status: "ใช้งานได้",
    brand: "Kubota",
    model: "M7060",
    lastMaintenance: "05/01/2567",
    nextMaintenance: "20/01/2567",
    pendingTasks: 2,
    searchKeywords: ["รถแทรกเตอร์", "kubota", "m7060", "ไร่", "a"],
    pmTemplate: {
      id: "PM-TRACTOR-WEEKLY",
      name: "การบำรุงรักษารถแทรกเตอร์ประจำสัปดาห์",
      estimatedTime: "2 ชั่วโมง",
      tasks: [
        "ตรวจสอบระดับน้ำมันเครื่อง",
        "ตรวจสอบระดับน้ำในหม้อน้ำ",
        "ตรวจสอบแรงดันลมยาง",
        "ทำความสะอาดไส้กรองอากาศ",
        "ตรวจสอบการทำงานของไฟส่องสว่าง"
      ]
    }
  },
  "TRACT-002": {
    id: "TRACT-002",
    name: "รถแทรกเตอร์ Massey Ferguson 4707",
    type: "รถแทรกเตอร์",
    location: "ไร่ B",
    status: "ต้องการบำรุงรักษา",
    brand: "Massey Ferguson",
    model: "4707",
    lastMaintenance: "01/01/2567",
    nextMaintenance: "เกินกำหนดแล้ว",
    pendingTasks: 3,
    searchKeywords: ["รถแทรกเตอร์", "massey", "ferguson", "4707", "ไร่", "b"],
    pmTemplate: {
      id: "PM-TRACTOR-WEEKLY",
      name: "การบำรุงรักษารถแทรกเตอร์ประจำสัปดาห์",
      estimatedTime: "2 ชั่วโมง",
      tasks: [
        "ตรวจสอบระดับน้ำมันเครื��อง",
        "ตรวจสอบระดับน้ำในหม้อน้ำ",
        "ตรวจสอบแรงดันลมยาง",
        "ทำความสะอาดไส้กรองอากาศ",
        "ตรวจสอบการทำงานของไฟส่องสว่าง"
      ]
    }
  },
  "PUMP-002": {
    id: "PUMP-002",
    name: "ปั๊มน้ำไฟฟ้า Mitsubishi 5HP",
    type: "ปั๊มน้ำ",
    location: "จุดควบคุมน้ำ B",
    status: "ต้องการบำรุงรักษา",
    brand: "Mitsubishi",
    model: "5HP",
    lastMaintenance: "20/12/2566",
    nextMaintenance: "15/01/2567",
    pendingTasks: 1,
    searchKeywords: ["ปั๊มน้ำ", "mitsubishi", "5hp", "จุดควบคุม", "น้ำ"],
    pmTemplate: {
      id: "PM-PUMP-MONTHLY",
      name: "การบำรุงรักษาปั๊มน้ำประจำเดือน",
      estimatedTime: "1.5 ชั่วโมง",
      tasks: [
        "ตรวจสอบการสั่นสะเทือนของปั๊ม",
        "ตรวจสอบการรั่วซึมของน้ำมัน",
        "ทำความสะอาดใบพัดและท่อดูด",
        "ตรวจสอบความตึงของสายพาน",
        "ตรวจสอบการทำงานของมอเตอร์"
      ]
    }
  },
  "PUMP-003": {
    id: "PUMP-003",
    name: "ปั๊มน้ำไฟฟ้า Grundfos CR5-8",
    type: "ปั๊มน้ำ",
    location: "จุดควบคุมน้ำ A",
    status: "ใช้งานได้",
    brand: "Grundfos",
    model: "CR5-8",
    lastMaintenance: "15/01/2567",
    nextMaintenance: "15/02/2567",
    pendingTasks: 0,
    searchKeywords: ["ปั๊มน้ำ", "grundfos", "cr5", "จุดควบคุม", "น้ำ"],
    pmTemplate: {
      id: "PM-PUMP-MONTHLY",
      name: "การบำรุงรักษาปั๊มน้ำประจำเดือน",
      estimatedTime: "1.5 ชั่วโมง",
      tasks: [
        "ตรวจสอบการสั่นสะเทือนของปั๊ม",
        "ตรวจสอบการรั่วซึมของน้ำมัน",
        "ทำความสะอาดใบพัดและท่อดูด",
        "ตรวจสอบ���วามตึงของสายพาน",
        "ตรวจสอบการทำงานของมอเตอร์"
      ]
    }
  },
  "HARV-003": {
    id: "HARV-003",
    name: "เครื่องเก็บเกี่ยว John Deere S660",
    type: "เครื่องเก็บเกี่ยว",
    location: "โรงเก็บอุปกรณ์",
    status: "ชำรุด",
    brand: "John Deere",
    model: "S660",
    lastMaintenance: "28/12/2566",
    nextMaintenance: "เกินกำหนดแล้ว",
    pendingTasks: 5,
    searchKeywords: ["เครื่องเก็บเกี่ยว", "john", "deere", "s660", "โรงเก็บ"],
    pmTemplate: {
      id: "PM-HARVESTER-DAILY",
      name: "การตรวจสอบเครื่องเก็บเกี่ยวประจำวัน",
      estimatedTime: "3 ชั่วโมง",
      tasks: [
        "ตรวจสอบใบมีดตัดและทำความสะอาด",
        "ตรวจสอบเข็มขัดลำเลียง",
        "ตรวจสอบระบบไฮดรอลิก",
        "ทำความสะอาดเครื่องแยกเม���็ด",
        "ตรวจสอบระบบเบรกและพวงมาลัย"
      ]
    }
  },
  "SPRAY-004": {
    id: "SPRAY-004",
    name: "เครื่องพ่นยา Amazone UX 3200",
    type: "เครื่องพ่นยา",
    location: "โรงเก็บอุปกรณ์",
    status: "ใช้งานได้",
    brand: "Amazone",
    model: "UX 3200",
    lastMaintenance: "10/01/2567",
    nextMaintenance: "25/01/2567",
    pendingTasks: 1,
    searchKeywords: ["เครื่องพ่นยา", "amazone", "ux", "3200", "โรงเก็บ"],
    pmTemplate: {
      id: "PM-SPRAYER-WEEKLY",
      name: "การบำรุงรักษาเครื่องพ่นยาประจำสัปดาห์",
      estimatedTime: "1 ชั่วโมง",
      tasks: [
        "ทำความสะอาดถังยาและท่อพ่น",
        "ตรวจสอบหัวพ่นและการทำงาน",
        "ตรวจสอบระบบปั๊มและแรงดัน",
        "ทำความสะอาดไส้กรองยา"
      ]
    }
  }
};

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedEquipment, setScannedEquipment] = useState<any>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);

  // Simulate camera scanning
  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        // Simulate scanning a random equipment QR code
        const equipmentIds = Object.keys(equipmentDatabase);
        const randomId = equipmentIds[Math.floor(Math.random() * equipmentIds.length)];
        handleScanSuccess(randomId);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const handleScanSuccess = (qrData: string) => {
    setIsScanning(false);
    setScanResult(qrData);
    
    const equipment = equipmentDatabase[qrData as keyof typeof equipmentDatabase];
    if (equipment) {
      setScannedEquipment(equipment);
      setScanHistory(prev => [qrData, ...prev.slice(0, 4)]); // Keep last 5 scans
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    setScannedEquipment(null);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ใช้งานได้":
        return "bg-success text-success-foreground";
      case "ต้องการบำรุงรักษา":
        return "bg-warning text-warning-foreground";
      case "ชำรุด":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ใช้งานได้":
        return <CheckCircle className="h-4 w-4" />;
      case "ต้องการบำรุงรักษา":
        return <Clock className="h-4 w-4" />;
      case "ชำรุด":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-3 sm:p-4 pb-20 md:pb-4 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-2 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold">สแกน QR Code</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            สแกน QR code บนอุปกรณ์เพื่อเริ่���งานบำรุงรักษา
          </p>
        </div>

        {/* Camera Interface */}
        <div className="card-elevated rounded-xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 aspect-square max-h-96">
            {!isScanning && !scannedEquipment && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                <QrCode className="h-16 w-16 opacity-50" />
                <p className="text-lg font-medium">พร้อมสแกน QR Code</p>
                <p className="text-sm opacity-75 text-center px-4">
                  กดปุ่มเริ่มสแกนเพื่อเปิดกล้องและสแกน QR code บนอุปกรณ์
                </p>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                <div className="relative">
                  <div className="w-48 h-48 border-2 border-white/50 rounded-xl relative">
                    {/* Scanning animation corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                    
                    {/* Scanning line animation */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse"></div>
                  </div>
                </div>
                <p className="text-lg font-medium">กำลังสแกน...</p>
                <p className="text-sm opacity-75">กรุณาให้ QR code อยู่ในกรอบ</p>
              </div>
            )}

            {/* Scanner Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFlashEnabled(!flashEnabled)}
                className={flashEnabled ? "bg-yellow-500 text-yellow-50" : ""}
              >
                <Flashlight className="h-4 w-4" />
              </Button>
              {isScanning && (
                <Button variant="destructive" size="sm" onClick={stopScanning}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Scan Button */}
          <div className="p-4">
            {!isScanning && !scannedEquipment && (
              <Button onClick={startScanning} className="w-full bg-gradient-to-r from-primary to-primary/90 shadow-lg">
                <Camera className="h-4 w-4 mr-2" />
                เริ่มสแกน QR Code
              </Button>
            )}
            
            {isScanning && (
              <Button onClick={stopScanning} variant="destructive" className="w-full">
                <X className="h-4 w-4 mr-2" />
                หยุดสแกน
              </Button>
            )}

            {scannedEquipment && (
              <Button onClick={startScanning} variant="outline" className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                สแกนใหม่
              </Button>
            )}
          </div>
        </div>

        {/* Scan Result */}
        {scannedEquipment && (
          <div className="space-y-4">
            {/* Equipment Info Card */}
            <div className="card-elevated rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{scannedEquipment.name}</h3>
                  <p className="text-sm text-muted-foreground">{scannedEquipment.id}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scannedEquipment.status)}`}>
                  {getStatusIcon(scannedEquipment.status)}
                  {scannedEquipment.status}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">ประเภท</div>
                    <div className="font-medium">{scannedEquipment.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">สถานที่</div>
                    <div className="font-medium">{scannedEquipment.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">บำรุงรักษาครั้งล่าสุด</div>
                    <div className="font-medium">{scannedEquipment.lastMaintenance}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">บำรุงรักษาครั้งต่อไป</div>
                    <div className="font-medium">{scannedEquipment.nextMaintenance}</div>
                  </div>
                </div>
              </div>

              {scannedEquipment.pendingTasks > 0 && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">
                      มีงานค้างอยู่ {scannedEquipment.pendingTasks} งาน
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PM Template Card */}
            <div className="card-elevated rounded-xl p-5">
              <h3 className="font-semibold mb-3">งานบำรุงรักษาที่แนะนำ</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{scannedEquipment.pmTemplate.name}</h4>
                  <Badge variant="outline">{scannedEquipment.pmTemplate.estimatedTime}</Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">รายการตรวจสอบ:</p>
                  <div className="space-y-1">
                    {scannedEquipment.pmTemplate.tasks.map((task: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to={`/create-work-order?equipment=${scannedEquipment.id}&template=${scannedEquipment.pmTemplate.id}`}>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/90">
                  <Wrench className="h-4 w-4 mr-2" />
                  เริ่มงานบำรุงรักษา
                </Button>
              </Link>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                ดูรายละเอียดอุปกรณ์
              </Button>
            </div>
          </div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="card-elevated rounded-xl p-5">
            <h3 className="font-semibold mb-3">ประวัติการสแกนล่าสุด</h3>
            <div className="space-y-2">
              {scanHistory.map((qrCode, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-sm font-mono">{qrCode}</span>
                  <Button variant="ghost" size="sm">
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
