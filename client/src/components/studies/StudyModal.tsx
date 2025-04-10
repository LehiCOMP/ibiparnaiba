import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertStudySchema, Study } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface StudyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  study?: Study;
}

// Extended schema for the form
const formSchema = insertStudySchema.extend({});

type FormData = z.infer<typeof formSchema>;

export default function StudyModal({ open, onOpenChange, userId, study }: StudyModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get default values for the form
  const getDefaultValues = () => {
    if (!study) {
      return {
        title: "",
        content: "",
        category: "",
        fileUrl: "",
        authorId: userId
      };
    }
    
    return {
      title: study.title,
      content: study.content,
      category: study.category,
      fileUrl: study.fileUrl || "",
      authorId: userId
    };
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const studyMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let response;
      if (study) {
        // Update existing study
        response = await apiRequest("PATCH", `/api/studies/${study.id}`, data);
      } else {
        // Create new study
        response = await apiRequest("POST", "/api/studies", data);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate studies queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/studies"] });
      
      // Close modal and show success message
      onOpenChange(false);
      toast({
        title: study ? "Estudo atualizado" : "Estudo criado",
        description: study 
          ? "O estudo foi atualizado com sucesso." 
          : "O estudo foi criado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${study ? 'atualizar' : 'criar'} estudo: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    studyMutation.mutate(data);
  };

  // Sample categories for select
  const categories = [
    "Teologia",
    "Antigo Testamento",
    "Novo Testamento",
    "Evangelhos",
    "Epístolas",
    "Doutrina",
    "Apologética",
    "Vida Cristã",
    "Família",
    "Missões",
    "Liderança"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-gray-700">
            {study ? "Editar Estudo" : "Criar Novo Estudo"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Estudo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: O Livro de Romanos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Conteúdo do estudo bíblico..." 
                      rows={8} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Material (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: https://exemplo.com/material-de-estudo.pdf" 
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
                    {study ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  study ? "Salvar" : "Criar Estudo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
