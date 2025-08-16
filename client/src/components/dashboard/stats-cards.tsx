import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";
import { MessageSquare, Bot, UserCheck, Clock, TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCards() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics/today"],
  });

  const stats = [
    {
      title: "Conversaciones Hoy",
      value: isLoading ? "..." : analytics?.totalConversations || 0,
      icon: MessageSquare,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "+12%",
      changeType: "positive",
      testId: "stat-conversations-today"
    },
    {
      title: "Respuestas Automáticas",
      value: isLoading ? "..." : analytics?.autoResponses || 0,
      icon: Bot,
      iconBg: "bg-whatsapp-100",
      iconColor: "text-whatsapp-600",
      change: "+8%",
      changeType: "positive",
      testId: "stat-auto-responses"
    },
    {
      title: "Derivaciones",
      value: isLoading ? "..." : analytics?.handoffs || 0,
      icon: UserCheck,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      change: "-3%",
      changeType: "negative",
      testId: "stat-handoffs"
    },
    {
      title: "Tiempo Respuesta",
      value: isLoading ? "..." : `${((analytics?.avgResponseTime || 0) / 1000).toFixed(1)}s`,
      icon: Clock,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "-0.5s",
      changeType: "positive",
      testId: "stat-response-time"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.changeType === "positive";
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <div 
            key={stat.title}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            data-testid={stat.testId}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <Icon className={`${stat.iconColor} text-xl`} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendIcon className={`h-4 w-4 mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-gray-500 text-sm ml-1">vs. ayer</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
