import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteSetting } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ImageUploader from "@/components/site-editor/ImageUploader";
import SiteConfigEditor from "@/components/site-editor/SiteConfigEditor";
import { queryClient } from "@/lib/queryClient";

export default function SiteEditorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("visual");
  
  // Buscar configurações do site
  const { data: siteSettings, isLoading } = useQuery<SiteSetting[]>({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      if (!res.ok) throw new Error("Failed to fetch site settings");
      return res.json();
    }
  });
  
  // Obter valores individuais das configurações
  const getSettingValue = (key: string) => {
    const setting = siteSettings?.find(s => s.key === key);
    return setting?.value;
  };
  
  // Verificar se o usuário é administrador
  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-600 mt-4">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-700">
            Editor do Site
          </h1>
          <p className="text-gray-500 mt-2">
            Personalize a aparência e as configurações do site.
          </p>
        </div>
        
        <Tabs 
          defaultValue="visual" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="textos">Textos</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>
          
          {/* Aba Visual - Logos e imagens */}
          <TabsContent value="visual" className="space-y-6">
            <h2 className="text-xl font-medium">Identidade Visual</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploader
                currentImageUrl={getSettingValue("logoUrl")}
                settingKey="logoUrl"
                label="Logo do Site"
                description="Recomendado: formato PNG ou SVG, fundo transparente, dimensões 200x100px."
              />
              
              <ImageUploader
                currentImageUrl={getSettingValue("faviconUrl")}
                settingKey="faviconUrl"
                label="Favicon"
                description="Ícone exibido na aba do navegador. Recomendado: formato ICO ou PNG, 32x32px."
              />
              
              <ImageUploader
                currentImageUrl={getSettingValue("heroImageUrl")}
                settingKey="heroImageUrl"
                label="Imagem de Destaque da Página Inicial"
                description="Imagem principal exibida no topo da página inicial. Recomendado: 1920x1080px."
              />
              
              <ImageUploader
                currentImageUrl={getSettingValue("aboutImageUrl")}
                settingKey="aboutImageUrl"
                label="Imagem da Seção Sobre"
                description="Imagem exibida na seção 'Sobre Nós'. Recomendado: 800x600px."
              />
            </div>
          </TabsContent>
          
          {/* Aba Textos - Conteúdos textuais */}
          <TabsContent value="textos" className="space-y-6">
            <h2 className="text-xl font-medium">Textos do Site</h2>
            
            <SiteConfigEditor
              settings={siteSettings || []}
              configGroup="textos"
              fields={[
                {
                  key: "siteName",
                  label: "Nome do Site",
                  description: "Nome principal exibido no cabeçalho e rodapé",
                  type: "text",
                  defaultValue: "IBI Parnaíba"
                },
                {
                  key: "siteTagline",
                  label: "Slogan do Site",
                  description: "Frase curta que aparece na página inicial",
                  type: "text",
                  defaultValue: "Transformando vidas pelo poder do evangelho"
                },
                {
                  key: "homeHeroTitle",
                  label: "Título do Banner Principal",
                  description: "Título principal da página inicial",
                  type: "text",
                  defaultValue: "Bem-vindo à IBI Parnaíba"
                },
                {
                  key: "homeHeroSubtitle",
                  label: "Subtítulo do Banner Principal",
                  description: "Texto complementar ao título",
                  type: "textarea",
                  defaultValue: "Venha fazer parte da nossa comunidade e crescer na fé"
                },
                {
                  key: "aboutTitle",
                  label: "Título da Seção Sobre",
                  description: "Título da seção 'Sobre Nós'",
                  type: "text",
                  defaultValue: "Sobre Nossa Igreja"
                },
                {
                  key: "aboutContent",
                  label: "Conteúdo da Seção Sobre",
                  description: "Texto principal da seção 'Sobre Nós'",
                  type: "textarea",
                  defaultValue: "A Igreja Batista Independente de Parnaíba tem como missão levar o evangelho de Cristo a todas as pessoas..."
                },
                {
                  key: "footerText",
                  label: "Texto do Rodapé",
                  description: "Mensagem que aparece no rodapé do site",
                  type: "textarea",
                  defaultValue: "Transformando vidas pelo poder do evangelho de Jesus Cristo. Venha fazer parte da nossa comunidade."
                }
              ]}
            />
          </TabsContent>
          
          {/* Aba Contato - Informações de contato */}
          <TabsContent value="contato" className="space-y-6">
            <h2 className="text-xl font-medium">Informações de Contato</h2>
            
            <SiteConfigEditor
              settings={siteSettings || []}
              configGroup="contato"
              fields={[
                {
                  key: "churchPhone",
                  label: "Telefone",
                  description: "Número de telefone principal",
                  type: "text",
                  defaultValue: "(86) 3323-0000"
                },
                {
                  key: "churchEmail",
                  label: "E-mail",
                  description: "E-mail de contato",
                  type: "text",
                  defaultValue: "contato@ibiparnaiba.org"
                },
                {
                  key: "churchAddress",
                  label: "Endereço",
                  description: "Endereço físico da igreja",
                  type: "textarea",
                  defaultValue: "Avenida Principal, 123, Parnaíba - PI"
                },
                {
                  key: "churchSchedule",
                  label: "Horário de Funcionamento",
                  description: "Horário dos cultos e expediente",
                  type: "textarea",
                  defaultValue: "Culto Dominical: Domingos às 19h\nCulto de Oração: Quartas às 19h30\nEscola Bíblica: Domingos às 9h"
                },
                {
                  key: "facebookUrl",
                  label: "Link do Facebook",
                  description: "URL da página do Facebook",
                  type: "text",
                  defaultValue: ""
                },
                {
                  key: "instagramUrl",
                  label: "Link do Instagram",
                  description: "URL do perfil do Instagram",
                  type: "text",
                  defaultValue: ""
                },
                {
                  key: "youtubeUrl",
                  label: "Link do YouTube",
                  description: "URL do canal do YouTube",
                  type: "text",
                  defaultValue: ""
                },
                {
                  key: "twitterUrl",
                  label: "Link do Twitter",
                  description: "URL do perfil do Twitter",
                  type: "text",
                  defaultValue: ""
                }
              ]}
            />
          </TabsContent>
          
          {/* Aba Configurações - Controles gerais do site */}
          <TabsContent value="configuracoes" className="space-y-6">
            <h2 className="text-xl font-medium">Configurações do Site</h2>
            
            <SiteConfigEditor
              settings={siteSettings || []}
              configGroup="configs"
              fields={[
                {
                  key: "enableRegistration",
                  label: "Habilitar Registro",
                  description: "Permitir que visitantes criem contas no site",
                  type: "toggle",
                  defaultValue: "true"
                },
                {
                  key: "enableEvents",
                  label: "Habilitar Eventos",
                  description: "Exibir seção de eventos no site",
                  type: "toggle",
                  defaultValue: "true"
                },
                {
                  key: "enableStudies",
                  label: "Habilitar Estudos",
                  description: "Exibir seção de estudos bíblicos no site",
                  type: "toggle",
                  defaultValue: "true"
                },
                {
                  key: "enableForum",
                  label: "Habilitar Fórum",
                  description: "Exibir seção de fórum no site",
                  type: "toggle",
                  defaultValue: "true"
                },
                {
                  key: "enableBlog",
                  label: "Habilitar Blog",
                  description: "Exibir seção de blog/notícias no site",
                  type: "toggle",
                  defaultValue: "true"
                },
                {
                  key: "adminApprovalRequired",
                  label: "Aprovação de Administrador",
                  description: "Exigir aprovação de admin para publicações de usuários",
                  type: "toggle",
                  defaultValue: "true"
                },
                {
                  key: "commentsModerationEnabled",
                  label: "Moderação de Comentários",
                  description: "Moderar comentários antes de publicá-los",
                  type: "toggle",
                  defaultValue: "true"
                },
                {
                  key: "primaryColor",
                  label: "Cor Primária",
                  description: "Cor principal do tema do site (formato HEX)",
                  type: "text",
                  defaultValue: "#3b82f6"
                }
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}