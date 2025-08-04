import { useQuery } from "@tanstack/react-query";
import { type VehicleWithLicense } from "@shared/schema";
import { Edit, RefreshCw, Search, Filter, Truck, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UpdateOdometerModal } from "@/components/update-odometer-modal";
import { RenewLicenseModal } from "@/components/renew-license-modal";
import { useState } from "react";

interface VehicleTableProps {
  statusFilter?: string | null;
}

export function VehicleTable({ statusFilter }: VehicleTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithLicense | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery<VehicleWithLicense[]>({
    queryKey: ["/api/vehicles"],
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    // Apply search filter
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply status filter
    const matchesStatus = statusFilter === null || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <div className="w-2 h-2 bg-success rounded-full mr-1"></div>
            Active
          </Badge>
        );
      case 'expiring':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            <div className="w-2 h-2 bg-warning rounded-full mr-1"></div>
            Expiring Soon
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-danger/10 text-danger border-danger/20">
            <div className="w-2 h-2 bg-danger rounded-full mr-1"></div>
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDistance = (distance: number) => {
    if (distance < 0) {
      return `-${Math.abs(distance).toLocaleString()} km`;
    }
    return `${distance.toLocaleString()} km`;
  };

  const handleUpdateOdometer = (vehicle: VehicleWithLicense) => {
    setSelectedVehicle(vehicle);
    setShowUpdateModal(true);
  };

  const handleRenewLicense = (vehicle: VehicleWithLicense) => {
    setSelectedVehicle(vehicle);
    setShowRenewModal(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Vehicle Fleet Status</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Fleet Status</h3>
              {statusFilter && (
                <p className="text-sm text-gray-600 mt-1">
                  Showing {statusFilter === 'expiring' ? 'expiring soon' : statusFilter} vehicles ({filteredVehicles.length})
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Odometer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Expires At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Distance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                        {vehicle.make.toLowerCase().includes('truck') || vehicle.model.toLowerCase().includes('truck') ? (
                          <Truck className="text-gray-500 w-5 h-5" />
                        ) : (
                          <Car className="text-gray-500 w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.plateNumber}</div>
                        <div className="text-sm text-gray-500">{vehicle.make} {vehicle.model} {vehicle.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vehicle.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.currentOdometer.toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vehicle.activeLicense 
                      ? `${vehicle.activeLicense.endOdometer.toLocaleString()} km`
                      : 'No active license'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      vehicle.status === 'expired' ? 'text-danger' :
                      vehicle.status === 'expiring' ? 'text-warning' : 'text-success'
                    }`}>
                      {formatDistance(vehicle.remainingDistance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateOdometer(vehicle)}
                        className="text-primary hover:text-blue-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Update
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRenewLicense(vehicle)}
                        className="text-success hover:text-green-700"
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Renew
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredVehicles.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm ? "No vehicles found matching your search." : "No vehicles registered yet."}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedVehicle && (
        <>
          <UpdateOdometerModal
            vehicle={selectedVehicle}
            open={showUpdateModal}
            onOpenChange={setShowUpdateModal}
          />
          <RenewLicenseModal
            vehicle={selectedVehicle}
            open={showRenewModal}
            onOpenChange={setShowRenewModal}
          />
        </>
      )}
    </>
  );
}
