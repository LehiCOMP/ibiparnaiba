import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/home/AnimatedLogo";

export default function Footer() {
  // Obter configurações do site
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
    enabled: true,
  });
  
  // Extrair valores das configurações
  const siteName = siteSettings?.find((s: any) => s.key === "siteName")?.value || "IBI Parnaíba";
  const logoUrl = siteSettings?.find((s: any) => s.key === "logoUrl")?.value;
  const address = siteSettings?.find((s: any) => s.key === "churchAddress")?.value || "Avenida Principal, 123, Parnaíba - PI";
  const phone = siteSettings?.find((s: any) => s.key === "churchPhone")?.value || "(86) 3323-0000";
  const email = siteSettings?.find((s: any) => s.key === "churchEmail")?.value || "contato@ibiparnaiba.org";
  
  // Links de redes sociais (extraídos das configurações, com fallbacks para valores vazios)
  const facebook = siteSettings?.find((s: any) => s.key === "facebookUrl")?.value || "";
  const instagram = siteSettings?.find((s: any) => s.key === "instagramUrl")?.value || "";
  const twitter = siteSettings?.find((s: any) => s.key === "twitterUrl")?.value || "";
  const youtube = siteSettings?.find((s: any) => s.key === "youtubeUrl")?.value || "";
  
  // Estrutura para o menu do rodapé
  const footerLinks = [
    {
      title: "Navegação",
      links: [
        { name: "Início", href: "/" },
        { name: "Eventos", href: "/events" },
        { name: "Estudos", href: "/studies" },
        { name: "Blog", href: "/posts" },
        { name: "Fórum", href: "/forum" },
      ],
    },
    {
      title: "Ministérios",
      links: [
        { name: "Louvor", href: "/ministerios/louvor" },
        { name: "Jovens", href: "/ministerios/jovens" },
        { name: "Crianças", href: "/ministerios/criancas" },
        { name: "Missões", href: "/ministerios/missoes" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { name: "Sermões", href: "/recursos/sermoes" },
        { name: "Devocional", href: "/recursos/devocional" },
        { name: "Materiais", href: "/recursos/materiais" },
        { name: "Contribuir", href: "/contribuir" },
      ],
    },
  ];
  
  // Redes sociais com seus respectivos ícones
  const socialLinks = [
    { name: "Facebook", href: facebook, icon: <Facebook size={18} /> },
    { name: "Instagram", href: instagram, icon: <Instagram size={18} /> },
    { name: "Twitter", href: twitter, icon: <Twitter size={18} /> },
    { name: "Youtube", href: youtube, icon: <Youtube size={18} /> },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo e Informações */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="h-12 w-auto" 
                />
              ) : (
                <AnimatedLogo className="h-12 w-auto" />
              )}
              <span className="ml-3 text-xl font-bold">{siteName}</span>
            </Link>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Transformando vidas pelo poder do evangelho de Jesus Cristo. Venha fazer parte da nossa comunidade.
            </p>
            
            {/* Informações de Contato */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-gray-600 dark:text-gray-300">{address}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-600 dark:text-gray-300">{phone}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-600 dark:text-gray-300">{email}</span>
              </div>
            </div>
            
            {/* Redes Sociais */}
            <div className="flex space-x-2 mt-6">
              {socialLinks.map((social) => (
                social.href && (
                  <a 
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-200 dark:bg-gray-800 hover:bg-primary hover:text-white dark:hover:bg-primary rounded-full p-2 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                )
              ))}
            </div>
          </div>
          
          {/* Links de Menu */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href}>
                      <span className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Rodapé inferior com direitos reservados */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
          </p>
          
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/privacidade">
              <span className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                Política de Privacidade
              </span>
            </Link>
            <Link href="/termos">
              <span className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                Termos de Uso
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}