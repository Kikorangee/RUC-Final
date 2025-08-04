import { RefreshCw, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddVehicleModal } from "@/components/add-vehicle-modal";
import { CsvImportModal } from "@/components/csv-import-modal";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";

export function Header() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Monitor your fleet's RUC license status</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="text-gray-700 hover:text-gray-900"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowImportModal(true)}
              className="mr-3"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </header>
      <AddVehicleModal open={showAddModal} onOpenChange={setShowAddModal} />
      <CsvImportModal open={showImportModal} onOpenChange={setShowImportModal} />
    </>
  );
}
