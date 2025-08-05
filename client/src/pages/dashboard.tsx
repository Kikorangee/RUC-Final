
// Direct MyGeotab API odometer fetch inside add-in
import { useEffect, useState } from "react";

const [odometerData, setOdometerData] = useState<any[]>([]);

useEffect(() => {
    if (typeof api === "undefined") {
        console.error("Geotab API object not found.");
        return;
    }
    const group = { id: "GroupCompanyId" }; // Adjust this group ID if needed
    const results: any[] = [];
    const now = new Date().toISOString();
    const diagnostic = { id: "DiagnosticOdometerAdjustmentId" };

    api.call("Get", { typeName: "Device", search: { groups: [group] }, resultsLimit: 100 }, function (devices) {
        const calls: any[] = [];
        devices.forEach(function (device: any) {
            results.push({
                id: device.id,
                name: device.name,
                vehicleIdentificationNumber: device.vehicleIdentificationNumber
            });
            calls.push({
                method: "Get",
                params: {
                    typeName: "StatusData",
                    search: {
                        fromDate: now,
                        toDate: now,
                        diagnosticSearch: diagnostic,
                        deviceSearch: { id: device.id }
                    }
                }
            });
        });

        api.call("ExecuteMultiCall", { calls: calls }, function (callResults: any) {
            for (let i = 0; i < callResults.length; i++) {
                const statusData = callResults[i][0];
                if (statusData) {
                    results[i].odometer = statusData.data;
                }
            }
            setOdometerData(results);
        });
    });
}, []);

// Merge odometer data into RUC table calculations
const vehiclesWithOdometer = vehicles.map(v => {
    const odoMatch = odometerData.find(o => o.id === v.id);
    return {
        ...v,
        odometer: odoMatch?.odometer || v.odometer,
        kmsRemaining: (odoMatch?.odometer ? v.rucExpiryKm - odoMatch.odometer : v.kmsRemaining)
    };
});


// Hook to fetch live odometer
import { useEffect, useState } from "react";
import axios from "axios";

const [odometerData, setOdometerData] = useState<any[]>([]);

useEffect(() => {
    async function fetchOdometer() {
        try {
            // You will need to supply valid sessionId and database name from MyGeotab login
            const sessionId = localStorage.getItem("geotabSessionId");
            const database = localStorage.getItem("geotabDatabase");
            if (!sessionId || !database) return;
            const resp = await axios.get(`/api/odometer?sessionId=${sessionId}&database=${database}`);
            setOdometerData(resp.data);
        } catch (e) {
            console.error("Failed to fetch odometer", e);
        }
    }
    fetchOdometer();
}, []);

// Merge odometer data into RUC table calculations
const vehiclesWithOdometer = vehicles.map(v => {
    const odoMatch = odometerData.find(o => o.id === v.id);
    return {
        ...v,
        odometer: odoMatch?.odometer || v.odometer,
        rucExpiryKm: v.rucExpiryKm, // Existing value
        kmsRemaining: (odoMatch?.odometer ? v.rucExpiryKm - odoMatch.odometer : v.kmsRemaining)
    };
});

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { AlertBanner } from "@/components/alert-banner";
import { StatsCards } from "@/components/stats-cards";
import { VehicleTable } from "@/components/vehicle-table";
import { useState } from "react";

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-6">
          <AlertBanner />
          <StatsCards 
            onStatusFilter={setStatusFilter} 
            activeFilter={statusFilter} 
          />
          <VehicleTable statusFilter={statusFilter} />
        </div>
      </main>
    </div>
  );
}


/* --- TABLE COLUMN PATCH START --- */

// Add Live Odometer column in the table header
<th>Live Odometer (km)</th>


// Display live odometer value in the table row
<td>{vehicle.odometer ? vehicle.odometer.toLocaleString() : "-"}</td>

/* --- TABLE COLUMN PATCH END --- */
