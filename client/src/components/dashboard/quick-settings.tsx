import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BotSettings } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function QuickSettings() {
  const { toast } = useToast();
  
  const { data: settings } = useQuery<BotSettings>({
    queryKey: ["/api/settings"],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<BotSettings>) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Configuración actualizada",
        description: "El cambio se ha guardado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (field: keyof BotSettings) => (checked: boolean) => {
    updateSettingsMutation.mutate({ [field]: checked });
  };

  const settingsConfig = [
    {
      key: 'autoResponses' as keyof BotSettings,
      title: "Respuestas Automáticas",
      description: "Activar respuestas predefinidas",
      testId: "toggle-auto-responses"
    },
    {
      key: 'businessHours' as keyof BotSettings,
      title: "Horario de Atención", 
      description: "Responder fuera de horario",
      testId: "toggle-business-hours"
    },
    {
      key: 'autoHandoff' as keyof BotSettings,
      title: "Derivación Automática",
      description: "Conectar con agentes",
      testId: "toggle-auto-handoff"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Configuración Rápida</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {settingsConfig.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-gray-900">
                {setting.title}
              </Label>
              <p className="text-xs text-gray-500">
                {setting.description}
              </p>
            </div>
            <Switch
              checked={settings?.[setting.key] as boolean || false}
              onCheckedChange={handleToggle(setting.key)}
              disabled={updateSettingsMutation.isPending}
              data-testid={setting.testId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
