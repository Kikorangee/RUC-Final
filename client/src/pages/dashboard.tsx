import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AlertBanner } from "@/components/alert-banner";
import { StatsCards } from "@/components/stats-cards";
import { VehicleTable } from "@/components/vehicle-table";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-6">
          <AlertBanner />
          <StatsCards />
          <VehicleTable />
        </div>
      </main>
    </div>
  );
}
