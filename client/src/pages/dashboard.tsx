import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import ChatPreview from "@/components/dashboard/chat-preview";
import ActiveConversations from "@/components/dashboard/active-conversations";
import QuickSettings from "@/components/dashboard/quick-settings";
import ResponseTable from "@/components/responses/response-table";

export default function Dashboard() {
  return (
    <main className="h-full overflow-y-auto">
      <Header 
        title="Dashboard"
        subtitle="Gestiona tu chatbot de WhatsApp Business"
        showNewResponseButton
      />
      
      <div className="p-6">
        <StatsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <ChatPreview />
          </div>
          <div className="space-y-6">
            <ActiveConversations />
            <QuickSettings />
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gestión de Respuestas</h3>
                  <p className="text-gray-600">Configura y edita las respuestas automáticas</p>
                </div>
              </div>
            </div>
            <ResponseTable showFilters={false} limit={5} />
          </div>
        </div>
      </div>
    </main>
  );
}
