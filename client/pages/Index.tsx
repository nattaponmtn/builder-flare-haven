import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../shared/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  LogIn,
  Settings,
  Shield,
  Smartphone,
  Wrench,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Wifi,
  Database,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"login" | "success">("login");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Show success animation
      setStep("success");
      toast.success("เข้าสู่ระบบสำเร็จ!");

      // Wait for animation then navigate
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาดไม่คาดคิด");
      toast.error("เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Settings, text: "จัดการงานบำรุงรักษา", color: "text-blue-500" },
    { icon: Shield, text: "ความปลอดภัยระดับสูง", color: "text-green-500" },
    { icon: Smartphone, text: "ใช้งานบนมือถือ", color: "text-purple-500" },
    { icon: Database, text: "ข้อมูลแบบเรียลไทม์", color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div
          className={
            'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
          }
        ></div>
      </div>

      {/* Left side - Branding & Features */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-12 text-white"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-md">
          {/* Logo and Title */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Wrench className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  CMMS Mobile Pro
                </h1>
                <p className="text-blue-200 text-sm">
                  Computerized Maintenance Management System
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            className="space-y-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-xl font-semibold mb-6">
              ระบบจัดการงานบำรุงรักษาที่ครบครัน
            </h2>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              >
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                <span className="text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Status indicators */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Wifi className="h-3 w-3 mr-1" />
              ออนไลน์
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Activity className="h-3 w-3 mr-1" />
              ระบบพร้อม
            </Badge>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
                  <CardHeader className="text-center pb-6">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <LogIn className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        เข้าสู่ระบบ
                      </CardTitle>
                      <p className="text-gray-500 text-sm mt-2">
                        กรุณาใส่ข้อมูลเพื่อเข้าใช้งานระบบ
                      </p>
                    </motion.div>
                  </CardHeader>

                  <CardContent>
                    <motion.form
                      onSubmit={handleLogin}
                      className="space-y-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          อีเมล
                        </Label>
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="email"
                            type="email"
                            placeholder="example@company.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="h-12 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          รหัสผ่าน
                        </Label>
                        <motion.div
                          className="relative"
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="h-12 pr-12 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Alert variant="destructive">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>เข้าสู่ระบบไม่สำเร็จ</AlertTitle>
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังเข้าสู่ระบบ...
                            </>
                          ) : (
                            <>
                              <LogIn className="mr-2 h-4 w-4" />
                              เข้าสู่ระบบ
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className="backdrop-blur-sm bg-white/95 border-white/20 shadow-2xl">
                  <CardContent className="pt-8 pb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6"
                    >
                      <CheckCircle className="h-10 w-10 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl font-bold text-gray-900 mb-2"
                    >
                      เข้าสู่ระบบสำเร็จ!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-gray-600"
                    >
                      กำลังไปยังแดชบอร์ด...
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile logo for small screens */}
      <motion.div
        className="lg:hidden absolute top-8 left-8 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">CMMS Pro</h1>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
