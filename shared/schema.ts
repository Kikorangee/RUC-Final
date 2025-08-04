import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plateNumber: text("plate_number").notNull().unique(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  currentOdometer: integer("current_odometer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rucLicenses = pgTable("ruc_licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  startOdometer: integer("start_odometer").notNull(),
  endOdometer: integer("end_odometer").notNull(),
  isActive: text("is_active").notNull().default("true"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertRucLicenseSchema = createInsertSchema(rucLicenses).omit({
  id: true,
  createdAt: true,
});

export const updateOdometerSchema = z.object({
  vehicleId: z.string(),
  newOdometer: z.number().min(0),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type RucLicense = typeof rucLicenses.$inferSelect;
export type InsertRucLicense = z.infer<typeof insertRucLicenseSchema>;
export type UpdateOdometer = z.infer<typeof updateOdometerSchema>;

export interface VehicleWithLicense extends Vehicle {
  activeLicense?: RucLicense;
  remainingDistance: number;
  status: 'active' | 'expiring' | 'expired';
}
