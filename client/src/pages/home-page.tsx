import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/Layout";
import AnimatedLogo from "@/components/home/AnimatedLogo";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Event } from "@shared/schema";
import { Calendar, Users, BookOpen, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HomePage() {
  const { user } = useAuth();
  
  // Buscar configurações do site
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    queryFn: async () => {
      const res = await fetch("/api/site-settings");
      if (!res.ok) throw new Error("Failed to fetch site settings");
      return res.json();
    }
  });
  
  // Buscar próximos eventos
  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events/upcoming", 3],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`${queryKey[0]}?count=${queryKey[1]}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      return res.json();
    }
  });
  
  // Configura o favicon dinamicamente
  useEffect(() => {
    if (siteSettings) {
      const faviconSetting = siteSettings.find((setting: any) => setting.key === "faviconUrl");
      if (faviconSetting && faviconSetting.value) {
        // Alterar o favicon
        const link = document.querySelector("link[rel='icon']") as HTMLLinkElement || 
                     document.createElement("link");
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = faviconSetting.value;
        document.head.appendChild(link);
      }
      
      // Configurar título do site
      const titleSetting = siteSettings.find((setting: any) => setting.key === "siteName");
      if (titleSetting && titleSetting.value) {
        document.title = titleSetting.value;
      }
    }
  }, [siteSettings]);
  
  // Obter configurações específicas
  const getSetting = (key: string, defaultValue: string = "") => {
    if (!siteSettings) return defaultValue;
    const setting = siteSettings.find((s: any) => s.key === key);
    return setting ? setting.value : defaultValue;
  };
  
  const heroImageUrl = getSetting("heroImageUrl", "");
  const churchName = getSetting("siteName", "Igreja Batista IBI Parnaíba");
  const tagline = getSetting("tagline", "Transformando vidas pelo poder do evangelho");
  const churchAddress = getSetting("churchAddress", "Av. Principal, 123, Parnaíba - PI");
  
  // Variantes para animação de seções
  const sectionVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.8,
        delay: 0.2
      }
    }
  };
  
  // Variantes para os cartões de eventos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <Layout title="Início">
      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {heroImageUrl && (
          <div 
            className="absolute inset-0 bg-no-repeat bg-cover bg-center opacity-20 -z-10"
            style={{ backgroundImage: `url(${heroImageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent" />
          </div>
        )}
        
        <div className="container mx-auto px-4">
          <AnimatedLogo className="mb-12" />
          
          <motion.div 
            className="flex flex-col lg:flex-row items-center justify-between gap-12 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h2 className="text-2xl font-serif font-bold mb-4">Horários de Culto</h2>
              <ul className="space-y-3">
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start text-gray-700">
                  <span className="font-medium mr-2">Domingo:</span> 
                  <span>09:00 - Escola Bíblica | 19:00 - Culto de Celebração</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start text-gray-700">
                  <span className="font-medium mr-2">Quarta-feira:</span> 
                  <span>19:30 - Culto de Oração e Estudo Bíblico</span>
                </li>
                <li className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start text-gray-700">
                  <span className="font-medium mr-2">Sexta-feira:</span> 
                  <span>19:30 - Culto de Jovens</span>
                </li>
              </ul>
              
              <div className="mt-6 flex flex-col sm:flex-row items-center sm:justify-center lg:justify-start gap-4">
                <Button className="w-full sm:w-auto">
                  <MapPin className="w-4 h-4 mr-2" />
                  Como Chegar
                </Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendário de Eventos
                </Button>
              </div>
            </div>
            
            <Card className="w-full lg:w-1/2 shadow-lg">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="font-serif text-center">Localização</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-gray-200 relative flex items-center justify-center p-6">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="text-lg font-medium">{churchName}</h3>
                    <p className="text-gray-600">{churchAddress}</p>
                    <Button className="mt-4" variant="outline" size="sm">
                      Abrir no Google Maps
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      {/* Mission Section */}
      <motion.section 
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-16 bg-primary/5"
      >
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-6">Nossa Missão</h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Existimos para glorificar a Deus, levando as pessoas a um relacionamento 
              transformador com Jesus Cristo, e capacitando-as a impactar o mundo através 
              do poder do Evangelho.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-center mb-2">Comunhão</h3>
                  <p className="text-gray-600 text-center">
                    Promovemos relacionamentos genuínos baseados no amor de Cristo.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-center mb-2">Discipulado</h3>
                  <p className="text-gray-600 text-center">
                    Incentivamos o crescimento espiritual contínuo através da Palavra.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary"><path d="M12 2v1"/><path d="M12 21v1"/><path d="m4.6 4.6.7.7"/><path d="m18.7 18.7.7.7"/><path d="M2 12h1"/><path d="M21 12h1"/><path d="m4.6 19.4.7-.7"/><path d="m18.7 5.3.7-.7"/><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/></svg>
                  </div>
                  <h3 className="text-xl font-medium text-center mb-2">Missão</h3>
                  <p className="text-gray-600 text-center">
                    Levamos a luz do evangelho para nossa comunidade e além.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Events Section */}
      <motion.section 
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Próximos Eventos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Confira nossos próximos eventos e participe conosco destes momentos especiais
            </p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            {events && events.length > 0 ? (
              events.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <Card className="h-full flex flex-col">
                    <CardHeader className="bg-primary/5 border-b pb-3 flex-shrink-0">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center text-primary">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(event.startTime), "dd 'de' MMMM", { locale: ptBR })}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-4 flex-grow">
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                      )}
                      <div className="flex items-start text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          {format(new Date(event.startTime), "HH:mm", { locale: ptBR })} - 
                          {format(new Date(event.endTime), " HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                Não há eventos programados no momento
              </div>
            )}
          </motion.div>
          
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <a href="/events">
                <Calendar className="w-4 h-4 mr-2" />
                Ver todos os eventos
              </a>
            </Button>
          </div>
        </div>
      </motion.section>
      
      {/* Call to Action */}
      <motion.section 
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-20 bg-primary text-white"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold mb-6">Junte-se a Nós</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Faça parte da nossa comunidade e venha crescer na fé conosco. 
            Estamos esperando por você!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
              Como se Tornar Membro
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Entre em Contato
            </Button>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}