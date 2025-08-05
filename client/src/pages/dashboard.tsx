

// --- Direct MyGeotab API Runner Odometer Fetch with Raw Fallback ---
useEffect(() => {
    if (typeof api === "undefined" || !vehicles) {
        console.error("Geotab API not available or vehicles undefined");
        return;
    }

    var group = { id: "GroupCompanyId" }, // Replace with actual group ID
        results: any[] = [];

    api.call("Get", {
        typeName: "Device",
        search: { "groups": [group] },
        resultsLimit: 100
    }, function (devices: any[]) {
        var now = new Date().toISOString(),
            callsAdjusted: any[] = [],
            callsRaw: any[] = [],
            diagnosticAdjusted = { id: "DiagnosticOdometerAdjustmentId" }, // Working ID from API Runner
            diagnosticRaw = { id: "DiagnosticOdometerId" }; // Raw odometer ID from API Runner

        devices.forEach(function (device: any) {
            results.push({
                id: device.id,
                name: device.name,
                vehicleIdentificationNumber: device.vehicleIdentificationNumber
            });
            callsAdjusted.push({
                method: "Get",
                params: {
                    typeName: "StatusData",
                    search: {
                        fromDate: now,
                        toDate: now,
                        diagnosticSearch: diagnosticAdjusted,
                        deviceSearch: { id: device.id }
                    }
                }
            });
            callsRaw.push({
                method: "Get",
                params: {
                    typeName: "StatusData",
                    search: {
                        fromDate: now,
                        toDate: now,
                        diagnosticSearch: diagnosticRaw,
                        deviceSearch: { id: device.id }
                    }
                }
            });
        });

        // First get adjusted readings
        api.call("ExecuteMultiCall", { calls: callsAdjusted }, function (adjustedResults: any[]) {
            for (var i = 0; i < adjustedResults.length; i++) {
                var statusData = adjustedResults[i][0];
                if (statusData) {
                    results[i].odometer = statusData.data;
                }
            }

            // Then get raw readings for any missing
            api.call("ExecuteMultiCall", { calls: callsRaw }, function (rawResults: any[]) {
                for (var i = 0; i < rawResults.length; i++) {
                    if (results[i].odometer == null && rawResults[i][0]) {
                        results[i].odometer = rawResults[i][0].data;
                    }
                }

                // Merge odometer readings into table data
                const updatedVehicles = vehicles.map(v => {
                    const match = results.find(r => r.id === v.id || r.name === v.name);
                    return match ? { ...v, odometer: match.odometer } : v;
                });

                setVehicles(updatedVehicles);
            });
        });
    });
}, []);
// --- End MyGeotab API Runner Odometer Fetch with Raw Fallback ---



import { useEffect, useState } from "react";

const [odometerData, setOdometerData] = useState<any[]>([]);

useEffect(() => {
    if (typeof api === "undefined") {
        console.error("Geotab API not available");
        return;
    }

    const group = { id: "GroupCompanyId" }; // Replace with actual group ID
    const results: any[] = [];
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
    const now = new Date().toISOString();

    // Step 1: Get Diagnostic ID for Odometer Adjustment
    api.call("Get", { typeName: "Diagnostic" }, function (diagnostics: any[]) {
        const odoDiag = diagnostics.find(d => d.name && d.name.toLowerCase().includes("odometer adjustment"));
        if (!odoDiag) {
            console.error("Odometer Adjustment diagnostic not found");
            return;
        }

        // Step 2: Get Devices in the group
        api.call("Get", { typeName: "Device", search: { groups: [group] }, resultsLimit: 100 }, function (devices: any[]) {
            const calls: any[] = [];
            devices.forEach(device => {
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
                            fromDate: from,
                            toDate: now,
                            diagnosticSearch: { id: odoDiag.id },
                            deviceSearch: { id: device.id }
                        },
                        resultsLimit: 1, // Only get most recent
                        sortOrder: "Descending"
                    }
                });
            });

            // Step 3: Execute multi-call for odometer readings
            api.call("ExecuteMultiCall", { calls: calls }, function (callResults: any[]) {
                for (let i = 0; i < callResults.length; i++) {
                    const statusData = callResults[i][0];
                    if (statusData) {
                        results[i].odometer = statusData.data;
                    }
                }
                setOdometerData(results);
            });
        });
    });
}, []);

// Merge odometer readings into RUC table
const vehiclesWithOdometer = vehicles.map(v => {
    const match = odometerData.find(o => o.id === v.id || o.name === v.name);
    return {
        ...v,
        odometer: match?.odometer ?? v.odometer,
        kmsRemaining: match?.odometer ? v.rucExpiryKm - match.odometer : v.kmsRemaining
    };
});


// Direct MyGeotab API odometer fetch inside add-in
import { useEffect, useState } from "react";


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
