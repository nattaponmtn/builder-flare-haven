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

// Mock equipment database สำหรับทดสอบการค้น���าหลากหลายกรณี
const equipmentDatabase = {
  "TRACT-001": {
    id: "TRACT-001",
    name: "รถแทรกเตอร์ Kubota M7060",
    type: "รถแทรกเตอร์",
    location: "ไร่ A",
    status: "ใช้���านได้",
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
        "ตรวจสอบระดับน้ำมันเครื่อง",
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
        "ตรวจสอบความตึงของสายพาน",
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
        "ทำความสะอาดเครื่องแยกเมล็ด",
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
      name: "การบำรุงรักษาเครื่องพ่นยาป���ะจำสัปดาห์",
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
  // QR Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedEquipment, setScannedEquipment] = useState<any>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  
  // Search states
  const [searchMode, setSearchMode] = useState<'qr' | 'search'>('qr');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  
  // เคสการใช้งานที่ต้องรองรั��
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "TRACT-001", "ปั๊มน้ำ", "ไร่ A", "Kubota"
  ]);

  // ระบบค้นหาแบบ Smart Search - รองรับหลายเงื่อนไข
  const performSearch = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase().trim();
    const equipmentList = Object.values(equipmentDatabase);
    
    return equipmentList.filter(equipment => {
      // ค้นหาจากรหัสอุปกรณ์
      if (equipment.id.toLowerCase().includes(term)) return true;
      
      // ค้นหาจากชื่ออุปกรณ์
      if (equipment.name.toLowerCase().includes(term)) return true;
      
      // ค้นหาจากประเภท
      if (equipment.type.toLowerCase().includes(term)) return true;
      
      // ค้นหาจากสถานที่
      if (equipment.location.toLowerCase().includes(term)) return true;
      
      // ค้นหาจากแบรนด์
      if (equipment.brand.toLowerCase().includes(term)) return true;
      
      // ค้นหาจากโมเดล
      if (equipment.model.toLowerCase().includes(term)) return true;
      
      // ��้นหาจาก keywords ที่กำหนดไว้
      if (equipment.searchKeywords.some(keyword => keyword.includes(term))) return true;
      
      return false;
    }).sort((a, b) => {
      // เรียงลำดับผลลัพธ์ - ที่ตรงที่สุดก่อน
      const aExactMatch = a.id.toLowerCase() === term || a.name.toLowerCase().includes(term);
      const bExactMatch = b.id.toLowerCase() === term || b.name.toLowerCase().includes(term);
      
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // เรียงตามสถานะ - ชำรุดก่อน, ต้องการบำรุงรักษา, ใช้งานได้
      const statusOrder = { "ชำรุด": 0, "ต้องการบำรุงรักษา": 1, "ใช้งานได้": 2 };
      return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    });
  }, [searchTerm]);

  // อัปเดตผลการค้นหาแบบ debounce
  useEffect(() => {
    if (searchMode === 'search') {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setSearchResults(performSearch);
        setIsSearching(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm, searchMode, performSearch]);

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
      setSelectedEquipment(equipment);
      setScanHistory(prev => [qrData, ...prev.slice(0, 4)]); // Keep last 5 scans
    }
  };

  const handleSearchSelect = (equipment: any) => {
    setSelectedEquipment(equipment);
    setScannedEquipment(equipment);
    
    // เพิ่มในประวัติการค้นหา
    if (searchTerm.trim()) {
      setSearchHistory(prev => {
        const newHistory = [searchTerm.trim(), ...prev.filter(item => item !== searchTerm.trim())];
        return newHistory.slice(0, 5); // Keep last 5 searches
      });
    }
  };

  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    setSearchMode('search');
  };

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    setScannedEquipment(null);
    setSelectedEquipment(null);
    setSearchMode('qr');
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const resetSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedEquipment(null);
    setScannedEquipment(null);
  };

  const switchToSearchMode = () => {
    setSearchMode('search');
    setIsScanning(false);
    setScannedEquipment(null);
    setSelectedEquipment(null);
  };

  const switchToQRMode = () => {
    setSearchMode('qr');
    resetSearch();
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
      case "���้องการบำรุงรักษา":
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
        <div className="space-y-3 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">ค้นหาอุปกรณ์</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              สแกน QR code หรือพิมพ์ค้นหาอุปกรณ์เพื่อเริ่มงานบำรุงรักษา
            </p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={searchMode === 'qr' ? 'default' : 'outline'}
              size="sm"
              onClick={switchToQRMode}
              className="flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              สแกน QR
            </Button>
            <Button
              variant={searchMode === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={switchToSearchMode}
              className="flex-1"
            >
              <Search className="h-4 w-4 mr-2" />
              ค้นหา
            </Button>
          </div>
        </div>

        {/* Search Interface */}
        {searchMode === 'search' && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="card-elevated rounded-xl p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ค้นหาด้วยรหัส, ชื่อ, ประเภท, สถานที่..."
                  className="pl-10 bg-background/50 border-0 shadow-sm text-base"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Quick Search Suggestions */}
              {!searchTerm && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-muted-foreground">ค้นหาด่วน:</p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(term)}
                        className="text-xs"
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="card-elevated rounded-xl">
                {isSearching ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">กำลังค้นหา...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y">
                    <div className="p-4 bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        พบ {searchResults.length} รายการ สำหรับ "{searchTerm}"
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((equipment) => (
                        <div
                          key={equipment.id}
                          onClick={() => handleSearchSelect(equipment)}
                          className="p-4 hover:bg-muted/30 cursor-pointer transition-colors border-l-4"
                          style={{
                            borderLeftColor: 
                              equipment.status === 'ชำรุด' ? '#ef4444' :
                              equipment.status === 'ต้องการบำรุงรักษา' ? '#f59e0b' : '#10b981'
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{equipment.name}</h4>
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
                                  {getStatusIcon(equipment.status)}
                                  {equipment.status}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground font-mono">{equipment.id}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>📍 {equipment.location}</span>
                                <span>🔧 {equipment.type}</span>
                                {equipment.pendingTasks > 0 && (
                                  <span className="text-warning">⚠️ {equipment.pendingTasks} งานค้าง</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-2">ไม่พบอุปกรณ์</p>
                    <p className="text-sm text-muted-foreground">
                      ลองค้นหาด้วยคำอื่น เช่น รหัสอุปกรณ์, ชื่อ, หรือสถานที่
                    </p>
                    
                    {/* แนะนำการค้นหา */}
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg text-left">
                      <p className="text-sm font-medium mb-2">💡 เทคนิคการค้นหา:</p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>• ใช้รหัส: TRACT-001, PUMP-002</p>
                        <p>• ใช้ชื่อ: รถแทรกเตอร์, ปั๊มน้ำ</p>
                        <p>• ใช้แบรนด์: Kubota, Mitsubishi</p>
                        <p>• ใช้สถานที่: ไร่ A, โรงเก็บอุปกรณ์</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Search History */}
            {searchHistory.length > 0 && !searchTerm && (
              <div className="card-elevated rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">ประวัติการค้นหา</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickSearch(term)}
                      className="text-xs h-8 px-3 bg-muted/30 hover:bg-muted/50"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera Interface */}
        {searchMode === 'qr' && (
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
        )}

        {/* Equipment Result Display */}
        {(scannedEquipment || selectedEquipment) && (
          <div className="space-y-4">
            {/* Equipment Info Card */}
            <div className="card-elevated rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{(scannedEquipment || selectedEquipment).name}</h3>
                  <p className="text-sm text-muted-foreground">{(scannedEquipment || selectedEquipment).id}</p>
                </div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor((scannedEquipment || selectedEquipment).status)}`}>
                  {getStatusIcon((scannedEquipment || selectedEquipment).status)}
                  {(scannedEquipment || selectedEquipment).status}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">ประเภท</div>
                    <div className="font-medium">{(scannedEquipment || selectedEquipment).type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">สถานที่</div>
                    <div className="font-medium">{(scannedEquipment || selectedEquipment).location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">บำรุงรักษาครั้งล่าสุด</div>
                    <div className="font-medium">{(scannedEquipment || selectedEquipment).lastMaintenance}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-muted-foreground">บำรุงรักษาครั้งต่อไป</div>
                    <div className="font-medium">{(scannedEquipment || selectedEquipment).nextMaintenance}</div>
                  </div>
                </div>
              </div>

              {(scannedEquipment || selectedEquipment).pendingTasks > 0 && (
                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">
                      มีงานค้างอยู่ {(scannedEquipment || selectedEquipment).pendingTasks} งาน
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
                  <h4 className="font-medium">{(scannedEquipment || selectedEquipment).pmTemplate.name}</h4>
                  <Badge variant="outline">{(scannedEquipment || selectedEquipment).pmTemplate.estimatedTime}</Badge>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">รายการตรวจสอบ:</p>
                  <div className="space-y-1">
                    {(scannedEquipment || selectedEquipment).pmTemplate.tasks.map((task: string, index: number) => (
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
              <Link to={`/create-work-order?equipment=${(scannedEquipment || selectedEquipment).id}&template=${(scannedEquipment || selectedEquipment).pmTemplate.id}`}>
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

        {/* QR Scan History */}
        {scanHistory.length > 0 && searchMode === 'qr' && (
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
