import { useQuery } from "@tanstack/react-query";
import { type VehicleWithLicense } from "@shared/schema";
import { AlertTriangle, XCircle } from "lucide-react";

export function AlertBanner() {
  const { data: vehicles = [] } = useQuery<VehicleWithLicense[]>({
    queryKey: ["/api/vehicles"],
  });

  const expiringSoon = vehicles.filter(v => v.status === 'expiring').length;
  const expired = vehicles.filter(v => v.status === 'expired').length;

  if (expiringSoon === 0 && expired === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      {expiringSoon > 0 && (
        <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertTriangle className="text-warning mr-3 w-5 h-5" />
            <div>
              <h3 className="text-sm font-medium text-warning">Expiring Soon</h3>
              <p className="text-sm text-gray-700 mt-1">
                {expiringSoon} vehicles have RUC licenses expiring within 2000km
              </p>
            </div>
          </div>
        </div>
      )}
      
      {expired > 0 && (
        <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-r-lg">
          <div className="flex items-center">
            <XCircle className="text-danger mr-3 w-5 h-5" />
            <div>
              <h3 className="text-sm font-medium text-danger">License Expired</h3>
              <p className="text-sm text-gray-700 mt-1">
                {expired} vehicle{expired !== 1 ? 's have' : ' has'} an expired RUC license
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
