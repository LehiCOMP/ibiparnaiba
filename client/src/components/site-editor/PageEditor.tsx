import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, Image, Link, Type } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageEditorProps {
  pageName: string;
  pageTitle: string;
  onBack: () => void;
}

// Form schema for page content
const pageSchema = z.object({
  content: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

type PageFormData = z.infer<typeof pageSchema>;

export default function PageEditor({ pageName, pageTitle, onBack }: PageEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  
  // Set up form
  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      content: `<h1>Conteúdo da página ${pageTitle}</h1>\n<p>Edite este conteúdo para personalizar a página.</p>`,
      metaTitle: pageTitle,
      metaDescription: `Página ${pageTitle} da Igreja IBI Parnaíba`,
      heroTitle: pageTitle,
      heroSubtitle: "Bem-vindo à Igreja Batista IBI Parnaíba",
      heroImageUrl: "",
    },
  });
  
  // Mock mutation for saving page content
  const savePageMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      // This endpoint would need to be implemented in the API
      // For now, just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Página salva",
        description: `A página ${pageTitle} foi salva com sucesso.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao salvar página: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: PageFormData) => {
    savePageMutation.mutate(data);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-serif font-bold text-gray-700">
            Editando: {pageTitle}
          </h1>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={savePageMutation.isPending}
          className="flex items-center gap-1"
        >
          {savePageMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Salvar Página</span>
            </>
          )}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="hero">Banner Principal</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form className="space-y-6 pt-4">
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo da Página</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Conteúdo</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conteúdo da página..." 
                            rows={20}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Banner Principal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="heroTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Banner</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="heroSubtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo do Banner</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <FormField
                      control={form.control}
                      name="heroImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Imagem do Banner</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: https://exemplo.com/imagem.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de SEO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Meta Tag</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Meta Tag</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descrição da página para mecanismos de busca..." 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          disabled={savePageMutation.isPending}
          className="flex items-center gap-1"
        >
          {savePageMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Salvar Página</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}