import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertRucLicenseSchema, type InsertRucLicense, type VehicleWithLicense } from "@shared/schema";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { z } from "zod";

interface RenewLicenseModalProps {
  vehicle: VehicleWithLicense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const renewLicenseSchema = insertRucLicenseSchema.omit({ vehicleId: true, isActive: true });

type RenewLicenseFormData = z.infer<typeof renewLicenseSchema>;

export function RenewLicenseModal({ vehicle, open, onOpenChange }: RenewLicenseModalProps) {
  const { toast } = useToast();
  
  const form = useForm<RenewLicenseFormData>({
    resolver: zodResolver(renewLicenseSchema),
    defaultValues: {
      startOdometer: vehicle.currentOdometer,
      endOdometer: vehicle.currentOdometer + 10000, // Default to 10,000km license
    },
  });

  const renewLicenseMutation = useMutation({
    mutationFn: async (data: RenewLicenseFormData) => {
      const response = await apiRequest("POST", "/api/licenses", {
        ...data,
        vehicleId: vehicle.id,
        isActive: "true",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "License renewed successfully",
        description: "A new RUC license has been issued for this vehicle.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to renew license",
        description: error.message || "An error occurred while renewing the license.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RenewLicenseFormData) => {
    if (data.endOdometer <= data.startOdometer) {
      form.setError("endOdometer", {
        message: "End odometer must be greater than start odometer",
      });
      return;
    }
    
    if (data.startOdometer < vehicle.currentOdometer) {
      form.setError("startOdometer", {
        message: "Start odometer cannot be less than current odometer",
      });
      return;
    }
    
    renewLicenseMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Renew RUC License</DialogTitle>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="text-sm text-gray-600">Vehicle</div>
          <div className="font-medium text-gray-900">{vehicle.plateNumber}</div>
          <div className="text-sm text-gray-500">{vehicle.make} {vehicle.model} {vehicle.year}</div>
          <div className="text-sm text-gray-500 mt-1">
            Current odometer: {vehicle.currentOdometer.toLocaleString()} km
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="startOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Start Odometer (km)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
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
              name="endOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License End Odometer (km)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This will deactivate any existing active license and create a new one for the specified distance range.
              </AlertDescription>
            </Alert>
            
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
                disabled={renewLicenseMutation.isPending}
              >
                {renewLicenseMutation.isPending ? "Renewing..." : "Renew License"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
