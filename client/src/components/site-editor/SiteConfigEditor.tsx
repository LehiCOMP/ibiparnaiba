import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Check, RefreshCw, Save } from "lucide-react";
import ImageUploader from "./ImageUploader";

// Schema para validação do formulário
const siteSettingsSchema = z.object({
  siteName: z.string().min(2, { message: "Nome do site é obrigatório" }),
  font: z.string().min(1, { message: "Fonte é obrigatória" }),
  borderRadius: z.string().min(1, { message: "Raio de borda é obrigatório" }),
  primaryColor: z.string().min(1, { message: "Cor primária é obrigatória" }),
  enableEvents: z.boolean().default(true),
  enableStudies: z.boolean().default(true),
  enableForum: z.boolean().default(true),
  enableBlog: z.boolean().default(true),
  
  // Campos opcionais
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  churchAddress: z.string().optional().or(z.literal("")),
  tagline: z.string().optional().or(z.literal("")),
  aboutText: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  instagramUrl: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  youtubeUrl: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  twitterUrl: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  
  // Imagens são gerenciadas separadamente através do ImageUploader
  logoUrl: z.string().optional().or(z.literal("")),
  faviconUrl: z.string().optional().or(z.literal("")),
  heroImageUrl: z.string().optional().or(z.literal("")),
  footerImageUrl: z.string().optional().or(z.literal("")),
});

type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

export default function SiteConfigEditor() {
  const [activeTab, setActiveTab] = useState("general");
  const [savedValues, setSavedValues] = useState<SiteSettingsFormData | null>(null);
  const { toast } = useToast();
  
  // Consulta para buscar as configurações atuais do site
  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      if (!res.ok) throw new Error("Failed to fetch site settings");
      return res.json();
    }
  });
  
  // Inicializar o formulário
  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      siteName: "Igreja Batista IBI Parnaíba",
      font: "Inter",
      borderRadius: "0.5rem",
      primaryColor: "#3b82f6",
      enableEvents: true,
      enableStudies: true,
      enableForum: true,
      enableBlog: true,
      email: "",
      phoneNumber: "",
      churchAddress: "",
      tagline: "",
      aboutText: "",
      facebookUrl: "",
      instagramUrl: "",
      youtubeUrl: "",
      twitterUrl: "",
      logoUrl: "",
      faviconUrl: "",
      heroImageUrl: "",
      footerImageUrl: "",
    },
  });
  
  // Processar os dados recebidos da API e carregar no formulário
  useEffect(() => {
    if (siteSettings) {
      const formValues: Partial<SiteSettingsFormData> = {};
      
      siteSettings.forEach((setting: any) => {
        const key = setting.key as keyof SiteSettingsFormData;
        
        // Processar valores booleanos
        if (key === "enableEvents" || key === "enableStudies" || key === "enableForum" || key === "enableBlog") {
          formValues[key] = setting.value === "true";
        } else {
          formValues[key] = setting.value;
        }
      });
      
      // Atualizar o formulário
      form.reset(formValues as SiteSettingsFormData);
      setSavedValues(formValues as SiteSettingsFormData);
    }
  }, [siteSettings, form]);
  
  // Mutação para salvar as configurações
  const saveMutation = useMutation({
    mutationFn: async (data: SiteSettingsFormData) => {
      const savedSettings = [];
      
      // Comparar com os valores anteriores para enviar apenas o que mudou
      for (const [key, value] of Object.entries(data)) {
        const currentValue = savedValues?.[key as keyof SiteSettingsFormData];
        
        // Converter booleanos para string
        const formattedValue = typeof value === "boolean" ? value.toString() : value;
        const formattedCurrentValue = typeof currentValue === "boolean" ? currentValue.toString() : currentValue;
        
        if (formattedValue !== formattedCurrentValue) {
          const res = await apiRequest("POST", "/api/site-settings", {
            key,
            value: formattedValue
          });
          
          savedSettings.push(await res.json());
        }
      }
      
      return savedSettings;
    },
    onSuccess: () => {
      // Atualizar o cache
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings"] });
      
      // Atualizar os valores salvos
      setSavedValues(form.getValues());
      
      toast({
        title: "Configurações salvas com sucesso",
        description: "As alterações foram aplicadas ao site"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Manipulador para enviar o formulário
  const onSubmit = (data: SiteSettingsFormData) => {
    saveMutation.mutate(data);
  };
  
  // Verificar se houve mudanças no formulário
  const isDirty = Object.keys(form.formState.dirtyFields).length > 0;
  
  // Variantes para animação
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
        <div>
          <h1 className="text-2xl font-bold">Configurações do Site</h1>
          <p className="text-gray-500">
            Personalize a aparência e funcionalidades do site
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            disabled={!isDirty || saveMutation.isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {saveMutation.isPending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="social">Contato & Social</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
            <motion.div
              key={activeTab}
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-8"
            >
              <TabsContent value="general" className="mt-0">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid gap-6">
                        <FormField
                          control={form.control}
                          name="siteName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Site</FormLabel>
                              <FormControl>
                                <Input placeholder="IBI Parnaíba" {...field} />
                              </FormControl>
                              <FormDescription>
                                Nome principal que aparecerá no cabeçalho e rodapé
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="tagline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Slogan</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Transformando vidas pelo poder do evangelho" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Uma breve descrição que será exibida na página inicial
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="enableEvents"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel>Habilitar Eventos</FormLabel>
                                  <FormDescription>
                                    Exibir seção de eventos no site
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
                          
                          <FormField
                            control={form.control}
                            name="enableStudies"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel>Habilitar Estudos</FormLabel>
                                  <FormDescription>
                                    Exibir seção de estudos no site
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
                          
                          <FormField
                            control={form.control}
                            name="enableForum"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel>Habilitar Fórum</FormLabel>
                                  <FormDescription>
                                    Exibir seção de fórum no site
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
                          
                          <FormField
                            control={form.control}
                            name="enableBlog"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between space-x-2 space-y-0 rounded-md border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel>Habilitar Blog</FormLabel>
                                  <FormDescription>
                                    Exibir seção de notícias/blog no site
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="appearance" className="mt-0">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="primaryColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cor Primária</FormLabel>
                                <div className="flex gap-2">
                                  <FormControl>
                                    <Input type="text" {...field} />
                                  </FormControl>
                                  <div 
                                    className="h-10 w-10 rounded-md border"
                                    style={{ backgroundColor: field.value }}
                                  />
                                </div>
                                <FormDescription>
                                  Cor principal do site (formato hex: #3b82f6)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="font"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fonte Principal</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Nome da fonte (ex: Inter, Roboto)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="borderRadius"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Raio de Borda</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  Arredondamento dos elementos (ex: 0.5rem)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator />
                        
                        <h3 className="text-lg font-medium">Imagens do Site</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ImageUploader
                            title="Logo do Site"
                            settingKey="logoUrl"
                            currentValue={form.watch("logoUrl")}
                            description="Imagem que aparece no cabeçalho e rodapé"
                            onComplete={(url) => form.setValue("logoUrl", url, { shouldDirty: true })}
                          />
                          
                          <ImageUploader
                            title="Favicon"
                            settingKey="faviconUrl"
                            currentValue={form.watch("faviconUrl")}
                            description="Ícone exibido na aba do navegador"
                            onComplete={(url) => form.setValue("faviconUrl", url, { shouldDirty: true })}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ImageUploader
                            title="Imagem de Destaque"
                            settingKey="heroImageUrl"
                            currentValue={form.watch("heroImageUrl")}
                            description="Imagem de fundo da seção principal na página inicial"
                            onComplete={(url) => form.setValue("heroImageUrl", url, { shouldDirty: true })}
                          />
                          
                          <ImageUploader
                            title="Imagem do Rodapé"
                            settingKey="footerImageUrl"
                            currentValue={form.watch("footerImageUrl")}
                            description="Imagem de fundo do rodapé"
                            onComplete={(url) => form.setValue("footerImageUrl", url, { shouldDirty: true })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="content" className="mt-0">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="churchAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço da Igreja</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Av. Principal, 123, Parnaíba - PI" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Endereço físico da igreja
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="aboutText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Texto Sobre a Igreja</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Conte um pouco sobre a história e missão da igreja..." 
                                  rows={6}
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Descrição detalhada que será exibida na página "Quem Somos"
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              <TabsContent value="social" className="mt-0">
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardContent className="pt-6">
                      <Accordion type="single" collapsible className="w-full" defaultValue="contact">
                        <AccordionItem value="contact">
                          <AccordionTrigger>Informações de Contato</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid gap-6 pt-4">
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email de Contato</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="email"
                                        placeholder="contato@ibiparnaiba.org" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Email principal para contato
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Telefone</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="(86) 99999-9999" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Número de telefone principal
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="social">
                          <AccordionTrigger>Redes Sociais</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid gap-6 pt-4">
                              <FormField
                                control={form.control}
                                name="facebookUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL do Facebook</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://facebook.com/ibiparnaiba" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Link completo para a página do Facebook
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="instagramUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL do Instagram</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://instagram.com/ibiparnaiba" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Link completo para o perfil do Instagram
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="youtubeUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL do YouTube</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://youtube.com/c/ibiparnaiba" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Link completo para o canal do YouTube
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="twitterUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>URL do Twitter</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="https://twitter.com/ibiparnaiba" 
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Link completo para o perfil do Twitter
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
              
              {isDirty && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="sticky bottom-4 bg-white dark:bg-gray-950 p-4 rounded-lg border shadow-lg z-10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-primary">
                      <Check className="h-5 w-5 mr-2" />
                      <span className="font-medium">Alterações não salvas</span>
                    </div>
                    <Button
                      type="submit"
                      disabled={saveMutation.isPending}
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      {saveMutation.isPending ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}