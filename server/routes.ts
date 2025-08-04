import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertRucLicenseSchema, updateOdometerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all vehicles with license information
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesWithLicenses();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  // Create a new vehicle
  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid vehicle data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create vehicle" });
      }
    }
  });

  // Update vehicle odometer
  app.patch("/api/vehicles/odometer", async (req, res) => {
    try {
      const validatedData = updateOdometerSchema.parse(req.body);
      const vehicle = await storage.updateVehicleOdometer(validatedData);
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid odometer data", errors: error.errors });
      } else {
        res.status(404).json({ message: "Vehicle not found" });
      }
    }
  });

  // Get RUC licenses for a vehicle
  app.get("/api/vehicles/:vehicleId/licenses", async (req, res) => {
    try {
      const licenses = await storage.getRucLicensesByVehicle(req.params.vehicleId);
      res.json(licenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch licenses" });
    }
  });

  // Create a new RUC license
  app.post("/api/licenses", async (req, res) => {
    try {
      const validatedData = insertRucLicenseSchema.parse(req.body);
      
      // Deactivate any existing active license for the vehicle
      const existingLicense = await storage.getActiveLicenseByVehicle(validatedData.vehicleId);
      if (existingLicense) {
        await storage.deactivateLicense(existingLicense.id);
      }
      
      const license = await storage.createRucLicense(validatedData);
      res.status(201).json(license);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid license data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create license" });
      }
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesWithLicenses();
      
      const stats = {
        totalVehicles: vehicles.length,
        activeLicenses: vehicles.filter(v => v.status === 'active').length,
        expiringSoon: vehicles.filter(v => v.status === 'expiring').length,
        expired: vehicles.filter(v => v.status === 'expired').length
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Clear all data (for testing)
  app.delete("/api/data/clear", async (req, res) => {
    try {
      // Clear all vehicles and licenses
      const allVehicles = await storage.getVehicles();
      const allLicenses = await storage.getRucLicenses();
      
      for (const license of allLicenses) {
        await storage.deactivateLicense(license.id);
      }
      
      // Reset storage (this is a simple in-memory storage clear)
      if (storage instanceof storage.constructor) {
        (storage as any).vehicles = new Map();
        (storage as any).rucLicenses = new Map();
      }
      
      res.json({ message: "All data cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
