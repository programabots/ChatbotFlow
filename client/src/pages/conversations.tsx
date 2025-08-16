import Header from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "@shared/schema";
import { MessageSquare, Clock, User } from "lucide-react";

export default function Conversations() {
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  return (
    <main className="h-full overflow-y-auto">
      <Header 
        title="Conversaciones"
        subtitle="Gestiona todas las conversaciones con clientes"
      />
      
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Todas las Conversaciones</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{conversations?.length || 0} conversaciones</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-whatsapp-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando conversaciones...</p>
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay conversaciones</h3>
              <p className="mt-1 text-sm text-gray-500">Las conversaciones aparecerán aquí cuando los clientes envíen mensajes.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  data-testid={`conversation-${conversation.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.customerName || `Cliente ${conversation.customerPhone.slice(-4)}`}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            conversation.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {conversation.status === 'active' ? 'Activa' : 'Cerrada'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.customerPhone}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(conversation.lastMessageAt).toLocaleString('es-ES')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
