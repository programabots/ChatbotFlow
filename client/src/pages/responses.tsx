import Header from "@/components/layout/header";
import ResponseTable from "@/components/responses/response-table";
import ResponseForm from "@/components/responses/response-form";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { PredefinedResponse } from "@shared/schema";

export default function Responses() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<PredefinedResponse | null>(null);

  const handleEdit = (response: PredefinedResponse) => {
    setEditingResponse(response);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingResponse(null);
  };

  return (
    <main className="h-full overflow-y-auto">
      <Header 
        title="Respuestas Automáticas"
        subtitle="Configura las respuestas predefinidas del chatbot"
        showNewResponseButton
        onNewResponse={() => setIsFormOpen(true)}
      />
      
      <div className="p-6">
        <ResponseTable 
          onEdit={handleEdit}
          showFilters={true}
        />
      </div>

      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-2xl">
          <ResponseForm 
            response={editingResponse}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}
