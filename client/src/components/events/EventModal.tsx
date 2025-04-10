import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertEventSchema, Event } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  event?: Event;
}

// Extended schema for the form with datetime validation
const formSchema = insertEventSchema.extend({
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
}).superRefine((data, ctx) => {
  // @ts-ignore - Estes campos existem no runtime mas não no tipo
  const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
  // @ts-ignore - Estes campos existem no runtime mas não no tipo
  const endDateTime = new Date(`${data.endDate}T${data.endTime}`);
  
  if (endDateTime <= startDateTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A data/hora de término deve ser posterior à data/hora de início",
      path: ["endDate"],
    });
  }
});

type FormData = z.infer<typeof formSchema>;

export default function EventModal({ open, onOpenChange, userId, event }: EventModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get default values for the form
  const getDefaultValues = () => {
    if (!event) {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      return {
        title: "",
        description: "",
        location: "",
        eventType: "worship",
        startDate: format(now, "yyyy-MM-dd"),
        startTime: format(now, "HH:mm"),
        endDate: format(oneHourLater, "yyyy-MM-dd"),
        endTime: format(oneHourLater, "HH:mm"),
        createdBy: userId
      };
    }
    
    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);
    
    return {
      title: event.title,
      description: event.description || "",
      location: event.location,
      eventType: event.eventType,
      startDate: format(startDate, "yyyy-MM-dd"),
      startTime: format(startDate, "HH:mm"),
      endDate: format(endDate, "yyyy-MM-dd"),
      endTime: format(endDate, "HH:mm"),
      createdBy: userId
    };
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const eventMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Convert form data to API format
      const { startDate, startTime, endDate, endTime, ...rest } = data;
      
      const apiData = {
        ...rest,
        startTime: new Date(`${startDate}T${startTime}`).toISOString(),
        endTime: new Date(`${endDate}T${endTime}`).toISOString(),
      };
      
      let response;
      if (event) {
        // Update existing event
        response = await apiRequest("PATCH", `/api/events/${event.id}`, apiData);
      } else {
        // Create new event
        response = await apiRequest("POST", "/api/events", apiData);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate events queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/upcoming"] });
      
      // Close modal and show success message
      onOpenChange(false);
      toast({
        title: event ? "Evento atualizado" : "Evento criado",
        description: event 
          ? "O evento foi atualizado com sucesso." 
          : "O evento foi criado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${event ? 'atualizar' : 'criar'} evento: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    eventMutation.mutate(data);
  };

  // Event types
  const eventTypes = [
    { value: "worship", label: "Culto" },
    { value: "prayer", label: "Oração" },
    { value: "study", label: "Estudo Bíblico" },
    { value: "youth", label: "Jovens" },
    { value: "children", label: "Crianças" },
    { value: "music", label: "Música" },
    { value: "other", label: "Outro" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-gray-700">
            {event ? "Editar Evento" : "Criar Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Culto de Domingo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Templo Principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Término</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhes sobre o evento..." 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {event ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  event ? "Salvar" : "Criar Evento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}