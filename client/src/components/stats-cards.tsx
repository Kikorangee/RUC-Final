import { useQuery } from "@tanstack/react-query";
import { Car, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface DashboardStats {
  totalVehicles: number;
  activeLicenses: number;
  expiringSoon: number;
  expired: number;
}

interface StatsCardsProps {
  onStatusFilter?: (status: string | null) => void;
  activeFilter?: string | null;
}

export function StatsCards({ onStatusFilter, activeFilter }: StatsCardsProps) {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const handleCardClick = (status: string | null) => {
    if (onStatusFilter) {
      // If clicking the same filter, clear it; otherwise set new filter
      onStatusFilter(activeFilter === status ? null : status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div 
        className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 ${
          activeFilter === null ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 cursor-pointer hover:shadow-md'
        }`}
        onClick={() => handleCardClick(null)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalVehicles}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Car className="text-primary text-xl" />
          </div>
        </div>
      </div>
      
      <div 
        className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 ${
          activeFilter === 'active' ? 'border-success ring-2 ring-success/20' : 'border-gray-200 cursor-pointer hover:shadow-md'
        }`}
        onClick={() => handleCardClick('active')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Licenses</p>
            <p className="text-3xl font-bold text-success">{stats.activeLicenses}</p>
          </div>
          <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-success text-xl" />
          </div>
        </div>
      </div>
      
      <div 
        className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 ${
          activeFilter === 'expiring' ? 'border-warning ring-2 ring-warning/20' : 'border-gray-200 cursor-pointer hover:shadow-md'
        }`}
        onClick={() => handleCardClick('expiring')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <p className="text-3xl font-bold text-warning">{stats.expiringSoon}</p>
          </div>
          <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="text-warning text-xl" />
          </div>
        </div>
      </div>
      
      <div 
        className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 ${
          activeFilter === 'expired' ? 'border-danger ring-2 ring-danger/20' : 'border-gray-200 cursor-pointer hover:shadow-md'
        }`}
        onClick={() => handleCardClick('expired')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Expired</p>
            <p className="text-3xl font-bold text-danger">{stats.expired}</p>
          </div>
          <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
            <XCircle className="text-danger text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
