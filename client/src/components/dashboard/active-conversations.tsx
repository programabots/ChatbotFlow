import { useQuery } from "@tanstack/react-query";
import type { Conversation } from "@shared/schema";
import { User, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function ActiveConversations() {
  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations/active"],
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Conversaciones Activas</h3>
      </div>
      
      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-whatsapp-500 border-r-transparent"></div>
          </div>
        ) : !conversations || conversations.length === 0 ? (
          <div className="text-center py-4">
            <MessageSquare className="mx-auto h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">No hay conversaciones activas</p>
          </div>
        ) : (
          conversations.slice(0, 3).map((conversation) => (
            <div 
              key={conversation.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              data-testid={`active-conversation-${conversation.id}`}
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conversation.customerName || `Cliente ${conversation.customerPhone.slice(-4)}`}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {conversation.lastMessage}
                </p>
              </div>
              <div className="text-right">
                {conversation.unreadCount > 0 && (
                  <div className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <Link href="/conversations">
          <a className="w-full text-whatsapp-600 text-sm font-medium hover:text-whatsapp-700 block text-center" data-testid="link-view-all-conversations">
            Ver todas las conversaciones
          </a>
        </Link>
      </div>
    </div>
  );
}
