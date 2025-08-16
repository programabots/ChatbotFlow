import { Link, useLocation } from "wouter";
import { Home, MessageSquare, Bot, BarChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/conversations", label: "Conversaciones", icon: MessageSquare },
  { path: "/responses", label: "Respuestas", icon: Bot },
  { path: "/analytics", label: "Analíticas", icon: BarChart },
  { path: "/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-whatsapp-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">ChatBot</h1>
            <p className="text-sm text-gray-500">WhatsApp Business</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-whatsapp-50 text-whatsapp-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
                data-testid={`nav-${item.path.replace("/", "") || "dashboard"}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <Settings className="text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@empresa.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
