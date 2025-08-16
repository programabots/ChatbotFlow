import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { PredefinedResponse, InsertPredefinedResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface ResponseFormProps {
  response?: PredefinedResponse | null;
  onClose: () => void;
}

export default function ResponseForm({ response, onClose }: ResponseFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InsertPredefinedResponse>({
    keywords: [],
    responseText: "",
    category: "",
    isActive: true
  });
  const [keywordInput, setKeywordInput] = useState("");

  const isEditing = !!response;

  useEffect(() => {
    if (response) {
      setFormData({
        keywords: response.keywords,
        responseText: response.responseText,
        category: response.category,
        isActive: response.isActive
      });
    }
  }, [response]);

  const createResponseMutation = useMutation({
    mutationFn: async (data: InsertPredefinedResponse) => {
      const response = await apiRequest("POST", "/api/responses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/responses"] });
      toast({
        title: "Respuesta creada",
        description: "La nueva respuesta se ha guardado correctamente.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la respuesta.",
        variant: "destructive",
      });
    },
  });

  const updateResponseMutation = useMutation({
    mutationFn: async (data: InsertPredefinedResponse) => {
      const result = await apiRequest("PUT", `/api/responses/${response!.id}`, data);
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/responses"] });
      toast({
        title: "Respuesta actualizada",
        description: "Los cambios se han guardado correctamente.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.keywords.length) {
      toast({
        title: "Error",
        description: "Debes agregar al menos una palabra clave.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.responseText.trim()) {
      toast({
        title: "Error", 
        description: "El texto de respuesta es requerido.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category.trim()) {
      toast({
        title: "Error",
        description: "La categoría es requerida.",
        variant: "destructive",
      });
      return;
    }

    if (isEditing) {
      updateResponseMutation.mutate(formData);
    } else {
      createResponseMutation.mutate(formData);
    }
  };

  const addKeyword = () => {
    const keyword = keywordInput.trim().toLowerCase();
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleKeywordInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const isPending = createResponseMutation.isPending || updateResponseMutation.isPending;

  return (
    <div>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Editar Respuesta" : "Nueva Respuesta Automática"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        
        {/* Keywords */}
        <div className="space-y-2">
          <Label htmlFor="keywords">Palabras Clave</Label>
          <div className="flex space-x-2">
            <Input
              id="keywords"
              type="text"
              placeholder="Agregar palabra clave..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={handleKeywordInputKeyPress}
              data-testid="input-keyword"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addKeyword}
              disabled={!keywordInput.trim()}
              data-testid="button-add-keyword"
            >
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.keywords.map((keyword, index) => (
              <Badge key={`${keyword}-${index}`} variant="secondary" className="text-sm">
                {String(keyword)}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-gray-500 hover:text-gray-700"
                  onClick={() => removeKeyword(String(keyword))}
                  data-testid={`button-remove-keyword-${keyword}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Estas palabras activarán esta respuesta automática.
          </p>
        </div>

        {/* Response Text */}
        <div className="space-y-2">
          <Label htmlFor="response-text">Texto de Respuesta</Label>
          <Textarea
            id="response-text"
            placeholder="Escribe la respuesta que enviará el bot..."
            value={formData.responseText}
            onChange={(e) => setFormData(prev => ({ ...prev, responseText: e.target.value }))}
            rows={4}
            data-testid="textarea-response-text"
          />
          <p className="text-xs text-gray-500">
            Puedes usar emojis y saltos de línea para hacer la respuesta más amigable.
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Selecciona una categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Precios">Precios</SelectItem>
              <SelectItem value="Información">Información</SelectItem>
              <SelectItem value="Soporte">Soporte</SelectItem>
              <SelectItem value="Derivación">Derivación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Respuesta Activa</Label>
            <div className="text-sm text-gray-500">
              Esta respuesta estará disponible para el bot
            </div>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            data-testid="switch-is-active"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="bg-whatsapp-500 hover:bg-whatsapp-600"
            disabled={isPending}
            data-testid="button-save-response"
          >
            {isPending 
              ? "Guardando..." 
              : isEditing 
                ? "Actualizar Respuesta" 
                : "Crear Respuesta"
            }
          </Button>
        </div>

      </form>
    </div>
  );
}
