import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPostSchema, Post } from "@shared/schema";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  post?: Post;
}

// Extended schema for the form
const formSchema = insertPostSchema.extend({});

type FormData = z.infer<typeof formSchema>;

export default function PostModal({ open, onOpenChange, userId, post }: PostModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get default values for the form
  const getDefaultValues = () => {
    if (!post) {
      return {
        title: "",
        content: "",
        imageUrl: "",
        authorId: userId,
        isPublished: true
      };
    }
    
    return {
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || "",
      authorId: userId,
      isPublished: post.isPublished
    };
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const postMutation = useMutation({
    mutationFn: async (data: FormData) => {
      let response;
      if (post) {
        // Update existing post
        response = await apiRequest("PATCH", `/api/posts/${post.id}`, data);
      } else {
        // Create new post
        response = await apiRequest("POST", "/api/posts", data);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate posts queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      // Close modal and show success message
      onOpenChange(false);
      toast({
        title: post ? "Postagem atualizada" : "Postagem criada",
        description: post 
          ? "A postagem foi atualizada com sucesso." 
          : "A postagem foi criada com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao ${post ? 'atualizar' : 'criar'} postagem: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    postMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-gray-700">
            {post ? "Editar Postagem" : "Criar Nova Postagem"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Postagem</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título da postagem" {...field} />
                  </FormControl>
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
                      placeholder="Conteúdo da postagem..." 
                      rows={10} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (opcional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: https://exemplo.com/imagem.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    URL para a imagem de destaque da postagem
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Publicar imediatamente
                    </FormLabel>
                    <FormDescription>
                      Se desativado, a postagem será salva como rascunho
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                    {post ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  post ? "Salvar" : "Criar Postagem"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
