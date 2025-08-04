import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateOdometerSchema, type UpdateOdometer, type VehicleWithLicense } from "@shared/schema";
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

interface UpdateOdometerModalProps {
  vehicle: VehicleWithLicense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateOdometerModal({ vehicle, open, onOpenChange }: UpdateOdometerModalProps) {
  const { toast } = useToast();
  
  const form = useForm<UpdateOdometer>({
    resolver: zodResolver(updateOdometerSchema),
    defaultValues: {
      vehicleId: vehicle.id,
      newOdometer: vehicle.currentOdometer,
    },
  });

  const updateOdometerMutation = useMutation({
    mutationFn: async (data: UpdateOdometer) => {
      const response = await apiRequest("PATCH", "/api/vehicles/odometer", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Odometer updated successfully",
        description: "The vehicle's odometer reading has been updated.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update odometer",
        description: error.message || "An error occurred while updating the odometer.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateOdometer) => {
    if (data.newOdometer < vehicle.currentOdometer) {
      form.setError("newOdometer", {
        message: "New odometer reading cannot be less than current reading",
      });
      return;
    }
    
    updateOdometerMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Odometer Reading</DialogTitle>
        </DialogHeader>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="text-sm text-gray-600">Vehicle</div>
          <div className="font-medium text-gray-900">{vehicle.plateNumber}</div>
          <div className="text-sm text-gray-500">{vehicle.make} {vehicle.model} {vehicle.year}</div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Odometer Reading (km)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={vehicle.currentOdometer.toString()}
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500">
                    Previous reading: {vehicle.currentOdometer.toLocaleString()} km
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This will automatically update the remaining distance calculation
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
                disabled={updateOdometerMutation.isPending}
              >
                {updateOdometerMutation.isPending ? "Updating..." : "Update Odometer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
