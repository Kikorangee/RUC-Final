import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CsvImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProcessedVehicle {
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  currentOdometer: number;
  licenseEndOdometer: number;
}

export function CsvImportModal({ open, onOpenChange }: CsvImportModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ProcessedVehicle[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSV = (text: string): ProcessedVehicle[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const vehicles: ProcessedVehicle[] = [];
    
    // Skip header and process data lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith(',,,') || line.includes('Summary:')) break; // Stop at empty rows or summary
      
      // Split CSV line properly handling quoted values
      const columns = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          columns.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      columns.push(current.trim()); // Add the last column
      
      if (columns.length < 5) continue;
      
      const description = columns[0]?.replace(/"/g, '').trim();
      const fleetNumber = columns[1]?.replace(/"/g, '').trim();
      const currentOdo = columns[3]?.replace(/[",]/g, '').trim();
      const expiredOdo = columns[4]?.replace(/[",]/g, '').trim();
      
      if (!description || !fleetNumber || !currentOdo || !expiredOdo) continue;
      
      // Parse vehicle description (e.g., "Toyota Hiace 2009")
      const descParts = description.split(' ');
      const lastPart = descParts[descParts.length - 1];
      const year = parseInt(lastPart) || new Date().getFullYear();
      const make = descParts[0] || 'Unknown';
      
      // Handle model - everything between make and year
      let model = 'Unknown';
      if (descParts.length > 2) {
        // If year is valid, exclude it from model
        if (!isNaN(parseInt(lastPart))) {
          model = descParts.slice(1, -1).join(' ') || 'Unknown';
        } else {
          model = descParts.slice(1).join(' ') || 'Unknown';
        }
      } else if (descParts.length === 2 && isNaN(parseInt(lastPart))) {
        model = descParts[1];
      }
      
      // Parse odometer values - current is in meters, expired is in km
      const currentOdometer = Math.round(parseFloat(currentOdo) / 1000); // Convert meters to km
      const licenseEndOdometer = Math.round(parseFloat(expiredOdo)); // Already in km
      
      if (currentOdometer > 0 && licenseEndOdometer > 0 && currentOdometer < 10000000) { // Sanity check
        vehicles.push({
          plateNumber: fleetNumber,
          make,
          model,
          year,
          currentOdometer,
          licenseEndOdometer
        });
      }
    }
    
    return vehicles;
  };

  const importVehiclesMutation = useMutation({
    mutationFn: async (vehicles: ProcessedVehicle[]) => {
      const results = [];
      
      for (const vehicleData of vehicles) {
        try {
          // Create vehicle
          const vehicleResponse = await apiRequest("POST", "/api/vehicles", {
            plateNumber: vehicleData.plateNumber,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            currentOdometer: vehicleData.currentOdometer,
          });
          
          const vehicle = await vehicleResponse.json();
          
          // Create RUC license
          await apiRequest("POST", "/api/licenses", {
            vehicleId: vehicle.id,
            startOdometer: vehicleData.currentOdometer,
            endOdometer: vehicleData.licenseEndOdometer,
            isActive: "true",
          });
          
          results.push(vehicle);
        } catch (error) {
          console.error(`Failed to import vehicle ${vehicleData.plateNumber}:`, error);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Import completed",
        description: `Successfully imported ${results.length} vehicles with their RUC licenses.`,
      });
      setFile(null);
      setPreviewData([]);
      setShowPreview(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "An error occurred during import.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const processed = parseCSV(text);
        setPreviewData(processed);
        setShowPreview(true);
      };
      reader.readAsText(selectedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleImport = () => {
    if (previewData.length > 0) {
      importVehiclesMutation.mutate(previewData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Fleet Data from CSV</DialogTitle>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Upload a CSV file with columns: Vehicle Description, Fleet #, Geotab Device ID, Current Odometer, Expired Odometer
              </AlertDescription>
            </Alert>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Choose CSV file to upload</p>
                <p className="text-sm text-gray-500">Select your fleet data CSV file</p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Found {previewData.length} vehicles ready to import. Review the data below and click Import to proceed.
              </AlertDescription>
            </Alert>
            
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Fleet #</th>
                    <th className="px-3 py-2 text-left">Vehicle</th>
                    <th className="px-3 py-2 text-left">Current Odometer</th>
                    <th className="px-3 py-2 text-left">License Expires At</th>
                    <th className="px-3 py-2 text-left">Remaining Distance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewData.map((vehicle, index) => {
                    const remaining = vehicle.licenseEndOdometer - vehicle.currentOdometer;
                    const status = remaining < 0 ? 'expired' : remaining <= 2000 ? 'expiring' : 'active';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{vehicle.plateNumber}</td>
                        <td className="px-3 py-2">{vehicle.make} {vehicle.model} {vehicle.year}</td>
                        <td className="px-3 py-2">{vehicle.currentOdometer.toLocaleString()} km</td>
                        <td className="px-3 py-2">{vehicle.licenseEndOdometer.toLocaleString()} km</td>
                        <td className="px-3 py-2">
                          <span className={`font-medium ${
                            status === 'expired' ? 'text-danger' :
                            status === 'expiring' ? 'text-warning' : 'text-success'
                          }`}>
                            {remaining < 0 ? `-${Math.abs(remaining).toLocaleString()}` : remaining.toLocaleString()} km
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setFile(null);
                  setPreviewData([]);
                }}
              >
                Back
              </Button>
              <div className="space-x-3">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={importVehiclesMutation.isPending || previewData.length === 0}
                >
                  {importVehiclesMutation.isPending ? "Importing..." : `Import ${previewData.length} Vehicles`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}