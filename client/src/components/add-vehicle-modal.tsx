import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AddVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertVehicleSchema.extend({
  licenseEndOdometer: insertVehicleSchema.shape.currentOdometer.refine(
    (val) => val > 0,
    "License end odometer must be greater than 0"
  ),
});

type FormData = InsertVehicle & { licenseEndOdometer: number };

export function AddVehicleModal({ open, onOpenChange }: AddVehicleModalProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateNumber: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      currentOdometer: 0,
      licenseEndOdometer: 0,
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Create vehicle first
      const vehicleResponse = await apiRequest("POST", "/api/vehicles", {
        plateNumber: data.plateNumber,
        make: data.make,
        model: data.model,
        year: data.year,
        currentOdometer: data.currentOdometer,
      });
      
      const vehicle = await vehicleResponse.json();
      
      // Create initial RUC license
      await apiRequest("POST", "/api/licenses", {
        vehicleId: vehicle.id,
        startOdometer: data.currentOdometer,
        endOdometer: data.licenseEndOdometer,
        isActive: "true",
      });
      
      return vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Vehicle added successfully",
        description: "The vehicle and its RUC license have been registered.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add vehicle",
        description: error.message || "An error occurred while adding the vehicle.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (data.licenseEndOdometer <= data.currentOdometer) {
      form.setError("licenseEndOdometer", {
        message: "License end odometer must be greater than current odometer",
      });
      return;
    }
    
    createVehicleMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Number</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Make</FormLabel>
                  <FormControl>
                    <Input placeholder="Ford" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Transit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="2020" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Odometer (km)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="50000" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="licenseEndOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RUC License Expiry Odometer (km)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="60000" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createVehicleMutation.isPending}
              >
                {createVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
