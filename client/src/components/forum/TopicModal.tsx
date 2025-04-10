import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertForumTopicSchema, ForumTopic } from "@shared/schema";
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

interface TopicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  topic?: ForumTopic;
}

// Extended schema for the form
const formSchema = insertForumTopicSchema.extend({});

type FormData = z.infer<typeof formSchema>;

export default function TopicModal({ open, onOpenChange, userId, topic }: TopicModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get default values for the form
  const getDefaultValues = () => {
    if (!topic) {
      return {
        title: "",
        content: "",
        category: "",
        authorId: userId
      };
    }
    
    return {
      title: topic.title,
      content: topic.content,
      category: topic.category,
      authorId: userId
    };
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const topicMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let response;
      if (topic) {
        // Update existing topic
        response = await apiRequest("PATCH", `/api/forum/topics/${topic.id}`, data);
      } else {
        // Create new topic
        response = await apiRequest("POST", "/api/forum/topics", data);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate topics queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/forum/topics"] });
      
      // Close modal and show success message
      onOpenChange(false);
      toast({
        title: topic ? "Tópico atualizado" : "Tópico criado",
        description: topic 
          ? "O tópico foi atualizado com sucesso." 
          : "O tópico foi criado com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${topic ? 'atualizar' : 'criar'} tópico: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    topicMutation.mutate(data);
  };

  // Sample categories for select
  const categories = [
    "Discussão",
    "Sugestão",
    "Reflexão",
    "Pedido de Oração",
    "Testemunho",
    "Dúvida",
    "Anúncio"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-gray-700">
            {topic ? "Editar Tópico" : "Criar Novo Tópico"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Tópico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reflexão sobre Salmos 23" {...field} />
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
                      placeholder="Compartilhe seus pensamentos..." 
                      rows={6} 
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
                    {topic ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  topic ? "Salvar" : "Criar Tópico"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}