import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  showNewResponseButton?: boolean;
  onNewResponse?: () => void;
}

export default function Header({ title, subtitle, showNewResponseButton, onNewResponse }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">Conectado</span>
          </div>
          {showNewResponseButton && (
            <Button 
              className="bg-whatsapp-500 text-white hover:bg-whatsapp-600"
              onClick={onNewResponse}
              data-testid="button-new-response"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nueva Respuesta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
