import { type Vehicle, type InsertVehicle, type RucLicense, type InsertRucLicense, type VehicleWithLicense, type UpdateOdometer } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vehicle operations
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicleOdometer(data: UpdateOdometer): Promise<Vehicle>;
  
  // RUC License operations
  getRucLicenses(): Promise<RucLicense[]>;
  getRucLicensesByVehicle(vehicleId: string): Promise<RucLicense[]>;
  getActiveLicenseByVehicle(vehicleId: string): Promise<RucLicense | undefined>;
  createRucLicense(license: InsertRucLicense): Promise<RucLicense>;
  deactivateLicense(licenseId: string): Promise<void>;
  
  // Combined operations
  getVehiclesWithLicenses(): Promise<VehicleWithLicense[]>;
}

export class MemStorage implements IStorage {
  private vehicles: Map<string, Vehicle>;
  private rucLicenses: Map<string, RucLicense>;

  constructor() {
    this.vehicles = new Map();
    this.rucLicenses = new Map();
  }

  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id,
      createdAt: new Date()
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicleOdometer(data: UpdateOdometer): Promise<Vehicle> {
    const vehicle = this.vehicles.get(data.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    
    const updatedVehicle: Vehicle = {
      ...vehicle,
      currentOdometer: data.newOdometer
    };
    
    this.vehicles.set(data.vehicleId, updatedVehicle);
    return updatedVehicle;
  }

  async getRucLicenses(): Promise<RucLicense[]> {
    return Array.from(this.rucLicenses.values());
  }

  async getRucLicensesByVehicle(vehicleId: string): Promise<RucLicense[]> {
    return Array.from(this.rucLicenses.values()).filter(
      license => license.vehicleId === vehicleId
    );
  }

  async getActiveLicenseByVehicle(vehicleId: string): Promise<RucLicense | undefined> {
    return Array.from(this.rucLicenses.values()).find(
      license => license.vehicleId === vehicleId && license.isActive === "true"
    );
  }

  async createRucLicense(insertLicense: InsertRucLicense): Promise<RucLicense> {
    const id = randomUUID();
    const license: RucLicense = {
      ...insertLicense,
      id,
      createdAt: new Date(),
      purchaseDate: new Date()
    };
    this.rucLicenses.set(id, license);
    return license;
  }

  async deactivateLicense(licenseId: string): Promise<void> {
    const license = this.rucLicenses.get(licenseId);
    if (license) {
      const updatedLicense: RucLicense = {
        ...license,
        isActive: "false"
      };
      this.rucLicenses.set(licenseId, updatedLicense);
    }
  }

  async getVehiclesWithLicenses(): Promise<VehicleWithLicense[]> {
    const vehicles = await this.getVehicles();
    const result: VehicleWithLicense[] = [];

    for (const vehicle of vehicles) {
      const activeLicense = await this.getActiveLicenseByVehicle(vehicle.id);
      
      let remainingDistance = 0;
      let status: 'active' | 'expiring' | 'expired' = 'active';
      
      if (activeLicense) {
        remainingDistance = activeLicense.endOdometer - vehicle.currentOdometer;
        
        if (remainingDistance < 0) {
          status = 'expired';
        } else if (remainingDistance <= 2000) {
          status = 'expiring';
        } else {
          status = 'active';
        }
      } else {
        status = 'expired';
        remainingDistance = 0;
      }

      result.push({
        ...vehicle,
        activeLicense,
        remainingDistance,
        status
      });
    }

    return result;
  }
}

export const storage = new MemStorage();
