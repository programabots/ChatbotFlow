import Header from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function Analytics() {
  const { data: todayAnalytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics/today"],
  });

  // Mock data for charts (in real app, this would come from API)
  const weeklyData = [
    { day: 'Lun', conversaciones: 45, respuestas: 38, derivaciones: 7 },
    { day: 'Mar', conversaciones: 52, respuestas: 43, derivaciones: 9 },
    { day: 'Mié', conversaciones: 61, respuestas: 51, derivaciones: 10 },
    { day: 'Jue', conversaciones: 58, respuestas: 49, derivaciones: 9 },
    { day: 'Vie', conversaciones: 73, respuestas: 62, derivaciones: 11 },
    { day: 'Sáb', conversaciones: 39, respuestas: 35, derivaciones: 4 },
    { day: 'Dom', conversaciones: 28, respuestas: 25, derivaciones: 3 },
  ];

  const responseTimeData = [
    { hora: '09:00', tiempo: 2.1 },
    { hora: '10:00', tiempo: 1.8 },
    { hora: '11:00', tiempo: 2.5 },
    { hora: '12:00', tiempo: 3.2 },
    { hora: '13:00', tiempo: 2.8 },
    { hora: '14:00', tiempo: 2.0 },
    { hora: '15:00', tiempo: 1.9 },
    { hora: '16:00', tiempo: 2.3 },
    { hora: '17:00', tiempo: 2.7 },
    { hora: '18:00', tiempo: 2.1 },
  ];

  return (
    <main className="h-full overflow-y-auto">
      <Header 
        title="Analíticas"
        subtitle="Estadísticas y métricas del chatbot"
      />
      
      <div className="p-6 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversaciones Hoy</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="text-conversations-today">
                  {isLoading ? "..." : todayAnalytics?.totalConversations || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm font-medium">+12%</span>
              <span className="text-gray-500 text-sm ml-1">vs. ayer</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa de Resolución</p>
                <p className="text-3xl font-bold text-gray-900">78%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm font-medium">+5%</span>
              <span className="text-gray-500 text-sm ml-1">vs. semana pasada</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tiempo Respuesta</p>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? "..." : `${((todayAnalytics?.avgResponseTime || 0) / 1000).toFixed(1)}s`}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm font-medium">-0.3s</span>
              <span className="text-gray-500 text-sm ml-1">vs. ayer</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfacción</p>
                <p className="text-3xl font-bold text-gray-900">4.7</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm font-medium">+0.2</span>
              <span className="text-gray-500 text-sm ml-1">vs. mes pasado</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Conversaciones por Día</h3>
              <p className="text-gray-600">Últimos 7 días</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="conversaciones" fill="#25D366" />
                  <Bar dataKey="respuestas" fill="#128C7E" />
                  <Bar dataKey="derivaciones" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Tiempo de Respuesta</h3>
              <p className="text-gray-600">Por hora del día</p>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tiempo" stroke="#25D366" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Resumen de Rendimiento</h3>
            <p className="text-gray-600">Métricas clave del mes actual</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-whatsapp-500 mb-2">1,247</div>
                <div className="text-sm text-gray-600">Conversaciones Totales</div>
                <div className="text-xs text-green-600 mt-1">+18% vs mes anterior</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">892</div>
                <div className="text-sm text-gray-600">Resueltas Automáticamente</div>
                <div className="text-xs text-green-600 mt-1">71.5% tasa de éxito</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-2">355</div>
                <div className="text-sm text-gray-600">Derivadas a Agentes</div>
                <div className="text-xs text-red-600 mt-1">28.5% del total</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
