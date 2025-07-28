import { motion } from "framer-motion";
import { 
  Heart, 
  Code, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Shield,
  Zap,
  Clock,
  Database,
  Smartphone,
  Settings,
  Award,
  Users,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const features = [
    { icon: Shield, text: "ระบบความปลอดภัยสูง" },
    { icon: Zap, text: "ประสิทธิภาพสูง" },
    { icon: Clock, text: "ใช้งานได้ 24/7" },
    { icon: Database, text: "สำรองข้อมูลอัตโนมัติ" },
    { icon: Smartphone, text: "รองรับมือถือ" },
    { icon: Settings, text: "กำหนดค่าได้ยืดหยุ่น" },
  ];

  const stats = [
    { icon: Users, value: "1,000+", label: "ผู้ใช้งาน" },
    { icon: Settings, value: "50,000+", label: "อุปกรณ์ที่จัดการ" },
    { icon: BarChart3, value: "99.9%", label: "ความเสถียร" },
    { icon: Award, value: "24/7", label: "การสนับสนุน" },
  ];

  const quickLinks = [
    { title: "แดชบอร์ด", href: "/dashboard" },
    { title: "ใบสั่งงาน", href: "/work-orders" },
    { title: "อุปกรณ์", href: "/assets" },
    { title: "รายงาน", href: "/reports" },
  ];

  const supportLinks = [
    { title: "คู่มือการใช้งาน", href: "#" },
    { title: "ช่วยเหลือ", href: "#" },
    { title: "ติดต่อเรา", href: "#" },
    { title: "เงื่อนไขการใช้งาน", href: "#" },
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
      
      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    CMMS Mobile Pro
                  </h3>
                  <p className="text-blue-200 text-sm">Computerized Maintenance Management System</p>
                </div>
              </div>
              
              <p className="text-blue-100 leading-relaxed mb-6 max-w-md">
                ระบบจัดการงานบำรุงรักษาที่ครบครันและทันสมัย 
                ช่วยให้องค์กรของคุณสามารถจัดการอุปกรณ์ 
                วางแผนการบำรุงรักษา และติดตามประสิทธิภาพได้อย่างมีประสิทธิภาพ
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 text-sm text-blue-100"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <feature.icon className="h-4 w-4 text-blue-300" />
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white">เมนูหลัก</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-blue-100 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold mb-6 text-white">ช่วยเหลือ</h4>
              <ul className="space-y-3 mb-6">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-blue-100 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:w-2 transition-all duration-200"></span>
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Contact Info */}
              <div className="space-y-3 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-300" />
                  <span>support@cmms-pro.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-300" />
                  <span>02-123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-300" />
                  <span>กรุงเทพฯ, ประเทศไทย</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div 
            className="mt-12 pt-8 border-t border-white/20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex justify-center mb-3">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <stat.icon className="h-6 w-6 text-blue-300" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-blue-100">
                <span>© {currentYear} CMMS Mobile Pro. สงวนลิขสิทธิ์</span>
                <span className="hidden md:block">•</span>
                <span className="flex items-center gap-1">
                  สร้างด้วย <Heart className="h-4 w-4 text-red-400" /> และ <Code className="h-4 w-4 text-blue-300" />
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-blue-200">ติดตามเรา:</span>
                <div className="flex gap-3">
                  <a 
                    href="#" 
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    <Github className="h-4 w-4 text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    <Twitter className="h-4 w-4 text-white" />
                  </a>
                  <a 
                    href="#" 
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    <Linkedin className="h-4 w-4 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
