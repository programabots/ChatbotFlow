import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { PredefinedResponse } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Copy, Trash2, Search, Download, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponseTableProps {
  onEdit?: (response: PredefinedResponse) => void;
  showFilters?: boolean;
  limit?: number;
}

export default function ResponseTable({ onEdit, showFilters = true, limit }: ResponseTableProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: responses, isLoading } = useQuery<PredefinedResponse[]>({
    queryKey: ["/api/responses"],
  });

  const deleteResponseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/responses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/responses"] });
      toast({
        title: "Respuesta eliminada",
        description: "La respuesta se eliminó correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la respuesta.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta respuesta?")) {
      deleteResponseMutation.mutate(id);
    }
  };

  const handleCopy = (response: PredefinedResponse) => {
    navigator.clipboard.writeText(response.responseText);
    toast({
      title: "Copiado",
      description: "El texto de la respuesta se copió al portapapeles.",
    });
  };

  // Filter responses based on search and category
  const filteredResponses = responses?.filter(response => {
    const matchesSearch = !searchQuery || 
      response.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())) ||
      response.responseText.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || response.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Apply limit if specified
  const displayedResponses = limit ? filteredResponses.slice(0, limit) : filteredResponses;

  // Get unique categories
  const categories = Array.from(new Set(responses?.map(r => r.category) || []));

  return (
    <div>
      {showFilters && (
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar respuestas o palabras clave..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                  data-testid="input-search-responses"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" data-testid="button-export">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              {onEdit && (
                <Button className="bg-whatsapp-500 hover:bg-whatsapp-600" size="sm" data-testid="button-add-response">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-whatsapp-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Cargando respuestas...</p>
          </div>
        ) : displayedResponses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No se encontraron respuestas que coincidan con los filtros.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Palabra Clave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Respuesta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedResponses.map((response) => (
                <tr key={response.id} className="hover:bg-gray-50" data-testid={`response-row-${response.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {response.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {response.keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{response.keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {response.responseText}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant="outline"
                      className={`text-xs font-medium ${
                        response.category === 'General' ? 'bg-green-100 text-green-800' :
                        response.category === 'Precios' ? 'bg-blue-100 text-blue-800' :
                        response.category === 'Derivación' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {response.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={response.isActive ? "default" : "secondary"}
                      className={`text-xs font-medium ${
                        response.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {response.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(response)}
                          className="text-whatsapp-600 hover:text-whatsapp-900"
                          data-testid={`button-edit-${response.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(response)}
                        className="text-gray-600 hover:text-gray-900"
                        data-testid={`button-copy-${response.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(response.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteResponseMutation.isPending}
                        data-testid={`button-delete-${response.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showFilters && !limit && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a{" "}
              <span className="font-medium">{Math.min(10, displayedResponses.length)}</span> de{" "}
              <span className="font-medium">{displayedResponses.length}</span> respuestas
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Anterior
              </Button>
              <Button variant="outline" size="sm" className="bg-whatsapp-500 text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
