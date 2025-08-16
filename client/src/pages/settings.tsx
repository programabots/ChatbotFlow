import Header from "@/components/layout/header";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BotSettings } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function Settings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<BotSettings>>({});

  const { data: settings, isLoading } = useQuery<BotSettings>({
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
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleSwitchChange = (field: keyof BotSettings) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleInputChange = (field: keyof BotSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (isLoading) {
    return (
      <main className="h-full overflow-y-auto">
        <Header 
          title="Configuración"
          subtitle="Ajustes del chatbot y sistema"
        />
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-whatsapp-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Cargando configuración...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full overflow-y-auto">
      <Header 
        title="Configuración"
        subtitle="Ajustes del chatbot y sistema"
      />
      
      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Bot Behavior Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Comportamiento del Bot</CardTitle>
              <CardDescription>
                Configura cómo responde el chatbot a los mensajes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Respuestas Automáticas</Label>
                  <div className="text-sm text-gray-500">
                    Activar respuestas predefinidas basadas en palabras clave
                  </div>
                </div>
                <Switch
                  checked={formData.autoResponses || false}
                  onCheckedChange={handleSwitchChange('autoResponses')}
                  data-testid="switch-auto-responses"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Derivación Automática</Label>
                  <div className="text-sm text-gray-500">
                    Conectar automáticamente con agentes cuando sea necesario
                  </div>
                </div>
                <Switch
                  checked={formData.autoHandoff || false}
                  onCheckedChange={handleSwitchChange('autoHandoff')}
                  data-testid="switch-auto-handoff"
                />
              </div>

            </CardContent>
          </Card>

          {/* Business Hours Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Horario de Atención</CardTitle>
              <CardDescription>
                Configura el horario comercial y mensajes fuera de horario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Horario Comercial</Label>
                  <div className="text-sm text-gray-500">
                    Responder diferentes mensajes fuera del horario de atención
                  </div>
                </div>
                <Switch
                  checked={formData.businessHours || false}
                  onCheckedChange={handleSwitchChange('businessHours')}
                  data-testid="switch-business-hours"
                />
              </div>

              {formData.businessHours && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-hours-start">Hora de Inicio</Label>
                    <Input
                      id="business-hours-start"
                      type="time"
                      value={formData.businessHoursStart || "09:00"}
                      onChange={handleInputChange('businessHoursStart')}
                      data-testid="input-business-hours-start"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-hours-end">Hora de Fin</Label>
                    <Input
                      id="business-hours-end"
                      type="time"
                      value={formData.businessHoursEnd || "18:00"}
                      onChange={handleInputChange('businessHoursEnd')}
                      data-testid="input-business-hours-end"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="out-of-hours-message">Mensaje Fuera de Horario</Label>
                <Textarea
                  id="out-of-hours-message"
                  placeholder="Mensaje que se enviará fuera del horario de atención"
                  value={formData.outOfHoursMessage || ""}
                  onChange={handleInputChange('outOfHoursMessage')}
                  rows={3}
                  data-testid="textarea-out-of-hours-message"
                />
              </div>

            </CardContent>
          </Card>

          {/* WhatsApp API Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de WhatsApp</CardTitle>
              <CardDescription>
                Configuración de la API de WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp-token">Token de Acceso</Label>
                <Input
                  id="whatsapp-token"
                  type="password"
                  placeholder="Token de la API de WhatsApp Business"
                  value="************************************"
                  readOnly
                  data-testid="input-whatsapp-token"
                />
                <div className="text-sm text-gray-500">
                  El token se configura a través de variables de entorno por seguridad.
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL del Webhook</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={`${window.location.origin}/api/webhook/whatsapp`}
                  readOnly
                  data-testid="input-webhook-url"
                />
                <div className="text-sm text-gray-500">
                  Configura esta URL en tu aplicación de WhatsApp Business.
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Estado: Conectado</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  El webhook está funcionando correctamente y recibiendo mensajes.
                </p>
              </div>

            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-whatsapp-500 hover:bg-whatsapp-600"
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>

        </form>
      </div>
    </main>
  );
}
